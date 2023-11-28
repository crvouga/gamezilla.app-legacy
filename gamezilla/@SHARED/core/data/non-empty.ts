export type NonEmpty<T> = [T, ...T[]];

const is = <T>(x: T[]): x is NonEmpty<T> => {
  return Array.isArray(x) && x.length > 0;
};

const last = <T>(xs: NonEmpty<T>): T => {
  const lastEl = xs[xs.length - 1];

  if (!lastEl) {
    throw new Error("Impossible state! NonEmpty array has no last element!");
  }

  return lastEl;
};

export const NonEmpty = {
  is,
  last,
};
