import { equals } from "./equals";

const difference = <TA, TB>(as: Array<TA>, bs: Array<TB>): Array<TA> => {
  return as.filter((a) => bs.every((b) => !equals(a, b)));
};

const cartesianProduct = <TA, TB, TC>(
  f: (a: TA, b: TB) => TC,
  as: Array<TA>,
  bs: Array<TB>
): Array<TC> => {
  return as.flatMap((a) => bs.map((b) => f(a, b)));
};

const head = <T>([x]: T[]): T | null => {
  return x ?? null;
};

const shuffle = <T>(x: T[]): T[] => {
  return x.sort(() => Math.floor(Math.random() * 2 - 1));
};

const concat = <T>(...xss: T[][]): T[] => {
  return xss.flat(1);
};

const any = <T>(predicate: (x: T) => boolean, xs: T[]): boolean => {
  return xs.some(predicate);
};

const take = <T>(n: number, xs: T[]): T[] => {
  if (n <= 0) {
    return [];
  }

  const [first, ...rest] = xs;

  if (first) {
    return [first, ...take(n - 1, rest)];
  }

  return [];
};

const drop = <T>(n: number, xs: T[]): T[] => {
  if (n === 0) {
    return xs;
  }

  const [_first, ...rest] = xs;

  return drop(n - 1, rest);
};

const splitAt = <T>(n: number, xs: T[]): [T[], T[]] => {
  return [take(n, xs), drop(n, xs)];
};

const splitEvery = <T>(n: number, xs: T[]): T[][] => {
  if (xs.length <= n) {
    return [xs];
  }

  const [first, rest] = splitAt(n, xs);

  return [first, ...splitEvery(n, rest)];
};

export const List = {
  difference,
  cartesianProduct,
  shuffle,
  head,
  concat,
  any,
  splitAt,
  splitEvery,
  take,
};
