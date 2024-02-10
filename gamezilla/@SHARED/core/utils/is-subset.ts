/**
 * @example
 * const eq = (a, b) => a === b
 * isSubset(eq, [], []) //=> true
 * isSubset(eq, [], ['a']) //=> true
 * isSubset(eq, ['a'], ['a']) //=> true
 * isSubset(eq, ['a'], ['a', 'b']) //=> true
 * isSubset(eq, ['a'], []) //=> false
 * isSubset(eq, ['a', 'b'], ['a']) //=> false
 */
export const isSubset = <X>(
  eq: (x1: X, x2: X) => boolean,
  a: X[],
  b: X[],
): boolean => {
  return a.every((x1) => b.some((x2) => eq(x1, x2)))
}
