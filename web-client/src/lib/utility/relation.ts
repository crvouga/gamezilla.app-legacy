import fastDeepEquals from "fast-deep-equal";

export const innerJoin = <TA, TB>(
  predicate: (a: TA, b: TB) => boolean,
  as: TA[],
  bs: TB[]
): TA[] => {
  return as.filter((a) => bs.every((b) => predicate(a, b)));
};

export const isEqual = <TA, TB>(a: TA, b: TB): boolean => {
  return fastDeepEquals(a, b);
};
