import commandLineArgs, { OptionDefinition, ParseOptions } from 'command-line-args';
import {
  array,
  boolean,
  infer as Infer,
  object,
  record,
  string,
  tuple,
  unknown,
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodObject,
  ZodRawShape,
  ZodTuple,
  ZodType,
  ZodTypeAny,
  ZodUnknown
} from 'zod';
import { Letter } from './utils';

export class Argument<ZodT extends ZodTypeAny = ZodTypeAny> {
  #value?: Infer<ZodT>;
  constructor(public zod: ZodT, public definition: OptionDefinition) {
    // definition.type = (input) => zod.parse(input) as Infer<ZodT>;
  }

  set value(val: Infer<ZodT>) {
    this.#value = this.zod.parse(val) as Infer<ZodT>;
  }

  get value() {
    return this.#value;
  }

  alias(name: Letter): this {
    this.definition.alias = name;
    return this;
  }
}
export type Action = () => void;

export type NamedArguments<T> = T extends Record<string, ZodAny>
  ? {
      [key in keyof T]: Argument<Infer<T[key]>>;
    }
  : T extends ZodAny
  ? Record<`${string}`, Argument<Infer<T>>>
  : never;

export type PositionalArguments<T extends ZodTypeAny[]> = T extends [
  infer X,
  ...infer Rest
]
  ? [
      Argument<X extends ZodTypeAny ? X : never>,
      ...(Rest extends ZodTypeAny[] ? PositionalArguments<Rest> : [])
    ]
  : [];

function dashCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export class Command {
  public hasCommand = false;

  constructor(public readonly name: string) {}
  _arguments: Argument[] = [
    new Argument(string(), {
      name: 'positionals',
      defaultOption: true,
      multiple: true,
      defaultValue: []
    })
  ];

  schema: {
    positionals?: ZodArray<ZodTypeAny> | ZodTuple;
    named?: ZodObject<ZodRawShape>;
  } = {};

  commands: Record<string, Command> = {};
  #positionals: Argument[] = [];
  #named: Record<string, Argument> = {};

  positionalCount = 0;
  parseOptions: ParseOptions = { stopAtFirstUnknown: true };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _executor: void | (() => void) = () => {};

  command(name: string, collector: (cmd: Command) => Action | void): this {
    const cmd = new Command(name);
    this.commands[name] = cmd;
    const fn = collector(cmd);
    if (fn) {
      cmd.action(fn);
    }
    return this;
  }

  positionals<T extends [ZodTypeAny, ...ZodTypeAny[]]>(value: T): PositionalArguments<T>;
  positionals<T extends ZodTypeAny>(value: T): Argument<Infer<T>>[];
  positionals(args: ZodTypeAny | [ZodTypeAny, ...ZodTypeAny[]]): Argument<ZodTypeAny>[] {
    if (Array.isArray(args)) {
      this.schema.positionals ??= tuple(args);
      for (const arg of args) {
        const value = new Argument(arg, {
          name: `positional:${this.positionalCount++}`
        });
        this.#positionals.push(value);
      }
    } else {
      this.schema.positionals ??= array(args);
      return new Proxy([], {
        get: (target, prop, receiver) => {
          if (prop === 'length') {
            return Infinity;
          }
          if (prop in target) {
            return Reflect.get(target, prop, receiver) as unknown;
          }
          const value = new Argument(args, {
            name: `positional:${this.positionalCount++}`
          });
          this.#positionals.push(value);
          return value;
        }
      });
    }

    return this.#positionals;
  }

  named<T extends ZodTypeAny>(struct: T): Record<string, Argument<T>>;
  named<T extends Record<string, ZodTypeAny>>(
    struct: T
  ): {
    [key in keyof T]: Argument<Infer<T[key]>>;
  };
  named(args: ZodRawShape | ZodTypeAny): Record<string, Argument<ZodTypeAny>> {
    if (args instanceof ZodType) {
      return new Proxy(
        {},
        {
          get: (_, prop: string) => {
            const arg = new Argument(args, {
              name: dashCase(prop)
            });
            this._arguments.push(arg);
            this.#named[prop] = arg;

            if (!this.schema.named) {
              this.schema.named = object({
                [prop]: args
              });
            } else {
              this.schema.named = this.schema.named.extend({
                [prop]: args
              });
            }

            return arg;
          }
        }
      );
    } else if (!this.schema.named) {
      this.schema.named = object(args);
    } else {
      this.schema.named = this.schema.named.extend(args);
    }
    return Object.fromEntries(
      Object.entries(args).map(([key, struct]) => {
        const arg = new Argument(struct, {
          name: dashCase(key)
        });
        this._arguments.push(arg);
        this.#named[key] = arg;

        return [key, arg];
      })
    );
  }

  parse(args: string[] = process.argv) {
    // const [command, ...arg] = args;
    // this._positionals['dirs'].value = arg[0];
    let splitIndex = args.findIndex((arg) => arg in this.commands);
    if (splitIndex === -1) {
      splitIndex = args.length;
    }
    const noCommandArgs = args.splice(splitIndex + 1);

    const { _unknown, ...params } = commandLineArgs(
      this._arguments.map((arg) => arg.definition),
      {
        argv: args,
        camelCase: true,
        ...this.parseOptions
      }
    );

    if (_unknown && _unknown.length > 0) {
      throw new Error(`Unknown command found ${_unknown[0]}`);
    }
    const values = object({
      positionals: string().array()
    })
      .and(record(unknown()))
      .safeParse(params);

    let commandName: string | undefined;

    if (values.success) {
      commandName = noCommandArgs.length > 0 ? values.data.positionals.pop() : undefined;
      const { positionals, ...named } = values.data;
      const result = { positionals, named };
      const schema = object(
        this.schema as {
          positionals: ZodArray<ZodType<unknown>>;
          named: ZodObject<Record<string, ZodUnknown>>;
        }
      ).parse(result);
      this.#positionals.forEach((arg, index) => {
        arg.value = schema.positionals[index];
      });

      Object.keys(this.#named).forEach((key) => {
        this.#named[key].value = schema.named[key];
      });
    }

    if (commandName) {
      const command = this.commands[commandName];
      command.parse(noCommandArgs);
    }
    if (this._executor) {
      this._executor();
    }
  }

  flags(): Record<string, Argument<ZodBoolean>> {
    return new Proxy(
      {},
      {
        get: (_, prop: string) => {
          const boolType = boolean().default(false);
          const arg = new Argument(boolType, {
            name: prop,
            type: Boolean
          });
          this.#named[prop] = arg;
          this._arguments.push(arg);

          if (!this.schema.named) {
            this.schema.named = object({
              [prop]: boolType
            });
          } else {
            this.schema.named = this.schema.named.extend({
              [prop]: boolType
            });
          }

          return arg;
        }
      }
    );
  }

  action(fn: () => void) {
    this._executor = fn;
  }
}

export function createCLI(name: string) {
  return new Command(name);
}
