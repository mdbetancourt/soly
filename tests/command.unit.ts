import { test } from 'uvu';
import { equal, throws } from 'uvu/assert';
import { number, preprocess } from 'zod';
import { createCLI, path, string } from '../src';

test('one command', () => {
  const cli = createCLI('cli');
  let executed = false;

  cli.command('copy', (copy) => {
    const [src, dst] = copy.positionals(string().optional(), 2, 2);
    const { branch, name } = copy.named(string().optional());

    branch.alias('b');

    const { maxRetries } = copy.named({
      maxRetries: preprocess(Number, number().min(0).default(3))
    });
    const { fetch, tags } = copy.flags();

    return () => {
      executed = true;
      equal(src.value, 'src/index.ts');
      equal(dst.value, 'dist/index.ts');
      equal(tags.value, true);
      equal(branch.value, 'master');
      equal(fetch.value, false);
      equal(maxRetries.value, 3);
      equal(name.value, undefined);
    };
  });

  cli.parse([
    'copy',
    'src/index.ts',
    'dist/index.ts',
    '--tags',
    '-b',
    'master',
    '--max-retries',
    '3'
  ]);

  equal(executed, true);
});

test('nested commands', () => {
  const cli = createCLI('cli');
  let executed = false;

  cli.command('copy', (copy) => {
    const [fromFile, toFile] = copy.positionals([path(), string()]);
    const { clone } = copy.flags();

    copy.command('link', (link) => {
      const { branch, name } = link.named(string().optional());

      branch.alias('b');

      const { maxRetries } = link.named({
        maxRetries: preprocess(Number, number().min(0).default(3))
      });
      const { fetch, tags } = link.flags();

      return () => {
        executed = true;
        equal(fromFile.value, 'src/index.ts');
        equal(toFile.value, 'dist/index.ts');
        equal(tags.value, true, 'tags must be true');
        equal(clone.value, true, 'clone must be true');
        equal(branch.value, 'master');
        equal(fetch.value, false);
        equal(maxRetries.value, 3);
        equal(name.value, undefined);
      };
    });
  });

  cli.parse([
    'copy',
    'src/index.ts',
    'dist/index.ts',
    '--clone',
    'link',
    '--tags',
    '-b',
    'master',
    '--max-retries',
    '3'
  ]);

  equal(executed, true);
});

test('command without arguments', () => {
  const cli = createCLI('cli');
  cli.command('copy', () => {
    return () => {
      throw new Error();
    };
  });

  throws(() => cli.parse(['copy']));
});

test('default command without arguments', () => {
  const cli = createCLI('cli');
  cli.action(() => {
    throw new Error();
  });

  throws(() => cli.parse(['copy']));
});

test('command depending another command', () => {
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
  throws(() => cli.parse(['copy', '--serve', '--out-folder', 'dist/']));
});

test('variadic', () => {
  const cli = createCLI('cli');
  let executed = false;

  cli.command('copy', (copy) => {
    const files = copy.positionals(string().optional(), 0, 3);

    return () => {
      executed = true;

      equal(
        files.map((ar) => ar.value),
        ['src/index.ts', 'dist/index.ts', undefined]
      );
    };
  });

  cli.parse(['copy', 'src/index.ts', 'dist/index.ts']);

  equal(executed, true);
});

test.run();
