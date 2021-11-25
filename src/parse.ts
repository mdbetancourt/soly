export function parse(str: string[]): Record<string, unknown> {
  const [nodePath, file, ...args] = str;
  return args;
}
