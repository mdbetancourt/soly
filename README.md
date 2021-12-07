<p align="center">
  <img src="logo.svg" width="200px" align="center" />
  <h1 align="center">Soly</h1>
</p>

**Sol** **Y**ellow, it's a CLI not just for Kryptonians. built with [zod](https://github.com/colinhacks/zod)

## Features

- **Easy to build**. Get default type validation and coercion with some builtin types like `path`, `absolute` or `file`
- **So powerful**. You get all the power of sun, soly enable you with features like default command, git-like subcommands, docker-like multi commands, parse and coerce arguments and options, variadic arguments, cluster options (-a -b -c -abc) and so on.
- **Developer friendly**. Written in TypeScript.

## Install

```bash
yarn add soly
```

or

```bash
pnpm i soly
```

### Command-specific Options

You can attach options to a command.

```ts
import { createCLI, path } from 'soly';
const cli = createCLI('cli');

cli.command('rm', (rm) => {
  // path is used to parse and throw error if the path does not exists
  const [dir] = rm.positionals([path()]);
  const { recursive } = rm.flags();
  recursive.alias('r');

  return () => {
    console.log(`remove ${dir.value}${recursive.value ? 'recursively' : ''}`);
  };
});

cli.parse();
```

### Variadic arguments

```ts
import { createCLI, string } from 'soly';
const cli = createCLI('cli');

cli.command('rm', (rm) => {
  // string for every positional
  const files = rm.positionals(string(), /* min */ 0, /* max */ 10);
  const { recursive } = rm.flags();
  recursive.alias('r');

  return () => {
    console.log(`Total files ${files.length}`);
  };
});

cli.parse();
```

### Dash in option names

Options in camelCase it's tranformed to kebab-case:

```ts
import { createCLI, number, z } from 'soly';

cli.command('fetch', (fetch) => {
  // You can define a type for every value
  const { maxRetries, method } = copy.named({
    maxRetries: number().min(0).default(3),
    method: z.enum(['http', 'https']).default('http')
  });

  return () => {
    console.log(maxRetries.value); // 4
  };
});

cli.parse(['fetch', '--max-retries', '4']);
```

In fact `--clear-screen` and `--clearScreen` are both mapped to `options.clearScreen`.

### Optional args

Like [zod](https://github.com/colinhacks/zod) all values are required by default you can make it optional with `.optional` or with `.default`

### Default Command

Register a command that will be used when no other command is matched.

```ts
import { createCLI, number, z } from 'soly';

cli.action(() => {
  return () => {
    console.log('default command'); // 4
  };
});

cli.parse();
```

### Exclusive flags

```ts
const cli = createCLI('cli');
cli.command('copy', (copy) => {
  const { serve } = copy.flags();
  const { outFolder } = copy.named({
    outFolder: string().refine(
      () => !serve.value,
      'Output folder cannot be set with serve'
    )
  });

  return () => {
    outFolder.value;
  };
});
cli.parse();
```
