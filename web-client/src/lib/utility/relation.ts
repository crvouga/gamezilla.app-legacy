export const innerJoin = <TA, TB>(
  predicate: (a: TA, b: TB) => boolean,
  as: TA[],
  bs: TB[]
): TA[] => {
  return as.filter((a) => bs.every((b) => predicate(a, b)));
};
