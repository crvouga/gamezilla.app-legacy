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
  // Fast path for primitives (except BigInt)
  if (input === null || typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') {
    return JSON.stringify(input)
  }
  // Fast path for BigInt
  if (typeof input === 'bigint') {
    return JSON.stringify(input.toString())
  }

  // Efficient recursive function to sort object keys and convert BigInt
  const normalize = (value: unknown): unknown => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    if (Array.isArray(value)) {
      // Arrays: preserve order, normalize elements
      return value.map(normalize)
    }
    if (value && typeof value === 'object') {
      // Objects: sort keys, normalize values
      const keys = Object.keys(value as Record<string, unknown>)
      if (keys.length === 0) return value
      const sorted: Record<string, unknown> = {}
      for (const key of keys.sort()) {
        sorted[key] = normalize((value as Record<string, unknown>)[key])
      }
      return sorted
    }
    return value
  }

  try {
    const normalized = normalize(input)
    const result = JSON.stringify(normalized)
    return result ?? 'null'
  } catch {
    return 'null'
  }
}
