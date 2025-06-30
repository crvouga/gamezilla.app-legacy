import { eq } from '../equals/equals'

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
export const isSubset = <X>(a: X[], b: X[], e: (x1: X, x2: X) => boolean = eq): boolean => {
  return a.every((x1) => b.some((x2) => e(x1, x2)))
}
