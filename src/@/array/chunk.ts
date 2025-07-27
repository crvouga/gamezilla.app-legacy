/**
 * Splits an array into smaller chunks of a specified size
 * @param arr The array to split into chunks
 * @param size The size of each chunk
 * @returns An array of chunks, each containing up to `size` elements from the input array
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * chunk([], 2) // []
 * chunk([1, 2, 3], 0) // []
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  if (!arr.length || size < 1 || !Number.isFinite(size)) {
    return []
  }

  const chunks: T[][] = []
  let i = 0

  while (i < arr.length) {
    chunks.push(arr.slice(i, i + size))
    i += size
  }

  return chunks
}
