/**
 *
 * @example
 * eq({}, {}) \\=> true
 * eq({a: {}}, {a: {}}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1] }}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1, 2] }}) \\=> false
 *
 */
export function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
