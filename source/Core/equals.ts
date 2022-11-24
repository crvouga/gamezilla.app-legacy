// todo remove this dependency
import fastDeepEquals from "fast-deep-equal"

/**
 *
 * @example
 * eq({}, {}) \\=> true
 * eq({a: {}}, {a: {}}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1] }}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1, 2] }}) \\=> false
 *
 */
export const eq = <A, B>(a: A, b: B): boolean => {
  return fastDeepEquals(a, b)
}
