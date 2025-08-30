/**
 * Returns the element with the minimum key value from an array, using a key function.
 * Returns undefined if the array is empty or contains falsy values.
 *
 * @example
 * // Find object with minimum age
 * const people = [{name: 'Alice', age: 25}, {name: 'Bob', age: 30}]
 * minBy(people, p => p.age) // {name: 'Alice', age: 25}
 *
 * @example
 * // Find shortest string
 * const words = ['cat', 'mouse', 'elephant']
 * minBy(words, w => w.length) // 'cat'
 *
 * @example
 * // Empty or invalid arrays
 * minBy([], x => x) // undefined
 * minBy([1, null, 2], x => x) // undefined
 *
 * @param arr - The input array
 * @param keyFn - Function to extract the comparison key from each element
 * @returns The element with minimum key value, or undefined if array is empty/invalid
 */
export const minBy = <T, K>(arr: T[], keyFn: (value: T) => K): T | undefined => {
  let min = arr[0]

  if (!min) {
    return undefined
  }

  let minKey: K = keyFn(min)

  let i

  for (i = 1; i < arr.length; i++) {
    const value = arr[i]

    if (!value) {
      return
    }

    const key = keyFn(value)

    if (key < minKey) {
      min = value
      minKey = key
    }
  }

  return min
}
