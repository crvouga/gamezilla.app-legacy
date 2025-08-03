/**
 * Filters an object's entries based on a predicate function
 * @param obj The object to filter
 * @param predicate Function that tests each entry, index and array
 * @returns A new object containing only the entries that passed the predicate
 * @example
 * const obj = { a: 1, b: 2, c: 3 }
 * filterObject(obj, ([key, value]) => value > 1)
 * // returns { b: 2, c: 3 }
 *
 * const user = { name: 'John', age: 30, admin: true }
 * filterObject(user, ([key]) => key !== 'admin')
 * // returns { name: 'John', age: 30 }
 */
export const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
): T => {
  const filtered = (Object.entries(obj) as Entry<T>[]).filter(predicate)
  return Object.fromEntries(filtered) as T
}

type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]
