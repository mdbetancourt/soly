/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// @ts-ignore
import { defineConfig, libraryPreset } from '@kraftr/build/craft';

export default defineConfig({
  entries: ['./src/index.ts'],
  plugins: [
    libraryPreset()
    // {
    //   writeBundle(_, bundle) {
    //     globalThis.UVU_QUEUE = [[null]];
    //     Object.values(bundle)
    //       .filter((v) => v.fileName.includes('.unit.mjs'))
    //       .forEach((b) => {
    //         if (b.type === 'chunk' && b.isEntry) {
    //           const fullPath = path.resolve(process.cwd(), 'dist', b.fileName);
    //           import(fullPath + `?cache=${new Date()}`);
    //         }
    //       });
    //   }
    // }
  ]
});
