import { equals } from "./equals";
import Maybe, { IMaybe } from "./maybe";

export const difference = <TA, TB>(as: Array<TA>, bs: Array<TB>): Array<TA> => {
  return as.filter((a) => bs.every((b) => !equals(a, b)));
};

export const cartesianProduct = <TA, TB, TC>(
  f: (a: TA, b: TB) => TC,
  as: Array<TA>,
  bs: Array<TB>
): Array<TC> => {
  return as.flatMap((a) => bs.map((b) => f(a, b)));
};

export const head = <T>(xs: T[]): IMaybe<T> => {
  if (xs.length === 0) {
    return Maybe.Nothing;
  }

  return Maybe.Just(xs[0]);
};

export const shuffle = <T>(x: T[]): T[] => {
  return x.sort(() => Math.floor(Math.random() * 2 - 1));
};

export const concat = <T>(...xss: T[][]): T[] => {
  return xss.flat(1);
};

export default {
  difference,
  cartesianProduct,
  shuffle,
  head,
  concat,
};
