/**
 * Maps the keys of an object to new keys using a mapping function, modifying the original object
 * @param obj The object to modify
 * @param fn The function to map keys with
 * @returns The modified object
 * @example
 * const obj = { 'foo-bar': 1, 'baz-qux': 2 }
 * inPlaceReplaceKeys(obj, key => key.replace(/-/g, ''))
 * // obj is now { foobar: 1, bazqux: 2 }
 */
export const inPlaceReplaceKeys = (obj: Record<string, unknown>, fn: (key: string) => string): void => {
  for (const oldKey in obj) {
    const newKey = fn(oldKey)
    obj[newKey] = obj[oldKey]
    if (newKey !== oldKey) {
      delete obj[oldKey]
    }
  }
}
