/**
 * Converts input into a flattened array containing only truthy values
 * @param input Input that can be a single value, array, null or undefined
 * @returns A flattened array with only truthy values
 * @example
 * flatTruthyArray(null) // []
 * flatTruthyArray([1, false, 2]) // [1, 2]
 * flatTruthyArray([1, [2, [3]]]) // [1, 2, 3]
 * flatTruthyArray([1, [2, false, [3]]]) // [1, 2, 3]
 * flatTruthyArray([1, [2, [3]], 4]) // [1, 2, 3, 4]
 */
export const flatTruthyArray = <T>(input: T | readonly T[] | null | undefined): Exclude<T, readonly any[]>[] => {
  if (!input) {
    return []
  }

  if (!Array.isArray(input)) {
    return [input as Exclude<T, readonly any[]>]
  }

  const result: Exclude<T, readonly any[]>[] = []
  const stack: (T | readonly T[])[] = [input]

  while (stack.length > 0) {
    const item = stack.pop()!

    if (Array.isArray(item)) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i])
      }
    } else if (item) {
      result.push(item as Exclude<T, readonly any[]>)
    }
  }

  return result
}
