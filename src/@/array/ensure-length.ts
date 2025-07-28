/**
 * Ensures an array has a specific length by padding with a fill value if needed
 * @param arr The input array
 * @param length The desired length
 * @param fill The value to pad with if array is shorter than length
 * @returns A new array of the specified length
 * @example
 * ensureLength(['x'], 3, null) // ['x', null, null]
 * ensureLength([1, 2], 4, 0) // [1, 2, 0, 0]
 * ensureLength([1, 2, 3], 2, 0) // [1, 2]
 */
export const ensureLength = <T>(arr: T[], length: number, fill: T): T[] => {
  if (!Number.isFinite(length)) return []
  if (isNaN(length)) return []
  if (length <= 0) return []

  const result = arr.slice(0, length)
  while (result.length < length) {
    result.push(fill)
  }
  return result // Don't spread since slice() already creates a new array
}
