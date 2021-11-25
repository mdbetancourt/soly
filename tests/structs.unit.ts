import { isAbsolute } from 'path';
import { test } from 'uvu';
import { equal, throws } from 'uvu/assert';
import { path, file, absolute } from '../src';

test('existing path', () => {
  const result = path();
  throws(() => result.parse('./cece__'));
});

test('is abs path', () => {
  const result = absolute();
  equal(isAbsolute(result.parse('./src/index.ts')), true);
});

test('existing path', () => {
  const result = path();
  result.parse('./src/index.ts');
});

test('file', () => {
  const result = file().parse('./src/index.ts');

  equal(Buffer.isBuffer(result), true);
});

// test('positional', () => {
//   const args = [
//     '/usr/bin/node',
//     '/home/mdbetancourt/Projects/open-source/inxt/tools/build/bin/craft.mjs',
//     'build',
//     'src/index.ts',
//     'dist/'
//   ];

//   const result = parse(args);

//   equal(result, { positional: ['src/index.ts', 'dist/'] });
// });

// test('named args', () => {
//   const args = [
//     '/usr/bin/node',
//     '/home/mdbetancourt/Projects/open-source/inxt/tools/build/bin/craft.mjs',
//     'build',
//     '--config',
//     'config.ts'
//   ];

//   const result = parse(args);

//   equal(result, { named: { config: 'config.ts' } });
// });

// test('name args', () => {
//   const args = [
//     '/usr/bin/node',
//     '/home/mdbetancourt/Projects/open-source/inxt/tools/build/bin/craft.mjs',
//     'build',
//     '--config=config.ts'
//   ];

//   const result = parse(args);

//   equal(result, { named: { config: 'config.ts' }, positional: ['build'] });
// });

// test('flag args', () => {
//   const args = [
//     '/usr/bin/node',
//     '/home/mdbetancourt/Projects/open-source/inxt/tools/build/bin/craft.mjs',
//     'build',
//     '--watch'
//   ];

//   const result = parse(args);

//   equal(result, { flags: new Set(['watch']), positional: ['build'] });
// });

// test('all together args', () => {
//   const args = [
//     '/usr/bin/node',
//     '/home/mdbetancourt/Projects/open-source/inxt/tools/build/bin/craft.mjs',
//     'build',
//     '--config',
//     'config.ts',
//     '--name=crest',
//     '--watch',
//     'dist/'
//   ];

//   const result = parse(args);

//   equal(result, {
//     flags: new Set(['watch']),
//     positional: ['build', 'dist/'],
//     named: { config: 'config.ts', name: 'crest' }
//   });
// });

test.run();
