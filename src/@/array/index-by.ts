/**
 * Creates an object mapping from an array by extracting a key from each item.
 * The resulting object will have keys determined by the key function, with corresponding array items as values.
 * If multiple items have the same key, later items will overwrite earlier ones.
 * @param arr - The input array to create a mapping from
 * @param key - Function that extracts a string key from each array item
 * @returns An object mapping keys to array items
 * @example
 * const users = [
 *   { id: 'user1', name: 'Alice' },
 *   { id: 'user2', name: 'Bob' }
 * ]
 * const userMap = indexBy(users, user => user.id)
 * // Result: {
 * //   user1: { id: 'user1', name: 'Alice' },
 * //   user2: { id: 'user2', name: 'Bob' }
 * // }
 */
export const indexBy = <T, TKey extends string>(arr: T[], key: (t: T) => TKey): Record<TKey, T> => {
  const result: Record<TKey, T> = Object.create(null) // Faster than {} for lookups
  const len = arr.length
  let i = 0
  for (; i < len; i++) {
    const item = arr[i]!
    result[key(item)] = item
  }
  return result
}
