/**
 * Converts a value to a deterministic JSON string representation.
 * This function ensures consistent string output by:
 * - Converting BigInt values to strings
 * - Sorting object keys alphabetically
 * - Preserving array order
 *
 * @param input - The value to stringify
 * @returns A deterministic JSON string representation of the input
 *
 * @example
 * ```ts
 * // Basic usage
 * deterministicJsonStringify(42) // "42"
 * deterministicJsonStringify("hello") // "\"hello\""
 *
 * // Object with unsorted keys
 * const obj = { b: 2, a: 1, c: 3 }
 * deterministicJsonStringify(obj) // "{\"a\":1,\"b\":2,\"c\":3}"
 *
 * // BigInt handling
 * deterministicJsonStringify(BigInt(123)) // "\"123\""
 *
 * // Nested objects
 * const nested = { b: { y: 2, x: 1 }, a: { z: 3, w: 0 } }
 * deterministicJsonStringify(nested) // "{\"a\":{\"w\":0,\"z\":3},\"b\":{\"x\":1,\"y\":2}}"
 * ```
 */
export const deterministicJsonStringify = (input: unknown): string => {
  try {
    const result = JSON.stringify(input, (_key, value) => {
      if (typeof value === 'bigint') {
        return value.toString()
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Create a new object with sorted keys
        return Object.keys(value)
          .sort()
          .reduce(
            (acc, key) => {
              acc[key] = value[key]
              return acc
            },
            {} as Record<string, unknown>,
          )
      }
      return value
    })
    return result ?? 'null'
  } catch {
    return 'null'
  }
}
