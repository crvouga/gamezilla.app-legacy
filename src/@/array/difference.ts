/**
 * Returns elements in array `a` that are not in array `b`, comparing by a key function
 *
 * @example
 * const a = [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}]
 * const b = [{id: '1', name: 'Alex'}]
 * difference(a, b, x => x.id) // [{id: '2', name: 'Bob'}]
 *
 * @example
 * const a = ['a1', 'b1', 'c1']
 * const b = ['a1', 'b1']
 * difference(a, b, x => x) // ['c1']
 */
export const difference = <T>(a: T[], b: T[], keyFn: (item: T) => string): T[] => {
  const bKeys = new Set(b.map(keyFn))
  return a.filter((item) => !bKeys.has(keyFn(item)))
}
