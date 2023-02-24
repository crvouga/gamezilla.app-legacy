import fastDeepEqual from 'fast-deep-equal';
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
  // TODO make this better
  return fastDeepEqual(a, b);
};
