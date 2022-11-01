import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { string } from 'zod';

export function path() {
  return string().refine((value) => existsSync(value), 'Path not found');
}

export function file() {
  return path().transform((path) => readFileSync(path));
}

export function absolute(options?: { cwd: string }) {
  return string().transform((value) => resolve(options?.cwd ?? process.cwd(), value));
}
