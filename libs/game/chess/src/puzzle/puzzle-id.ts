export type PuzzleId = string & { _tag: 'PuzzleId' };

export const is = (s: unknown): s is PuzzleId => {
  return typeof s === 'string' && s.length === 8;
};

export const PuzzleId = {
  is,
};
