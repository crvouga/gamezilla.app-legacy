import { eq } from '../equals/equals'

/**
 * @example
 * const eq = (a, b) => a === b
 * isSuperset(eq, [], []) //=> true
 * isSuperset(eq, ['a'], []) //=> true
 * isSuperset(eq, ['a'], ['a']) //=> true
 * isSuperset(eq, ['a', 'b'], ['a']) //=> true
 * isSuperset(eq, [], ['a']) //=> false
 * isSuperset(eq, ['a'], ['a', 'b']) //=> false
 */
export const isSuperset = <T>(a: T[], b: T[], e: (x1: T, x2: T) => boolean = eq): boolean => {
  return b.every((x1) => a.some((x2) => e(x1, x2)))
}
