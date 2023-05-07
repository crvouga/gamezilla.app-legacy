export type NonEmpty<T> = [T, ...T[]];

const is = <T>(x: T[]): x is NonEmpty<T> => {
  return Array.isArray(x) && x.length > 0;
};

export const NonEmpty = {
  is,
};
