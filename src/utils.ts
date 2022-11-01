export type AnyObject = {
  [k: string]: unknown;
  [k: number]: unknown;
  [k: symbol]: unknown;
};

export type ParsedArgs = {
  commands: string[];
  positionals: unknown[];
  flags: string[];
};

export type Alphabet =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

export type Letter = Lowercase<Alphabet> | Uppercase<Alphabet>;
