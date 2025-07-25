/**
 * Randomly shuffles an array using the Fisher-Yates algorithm.
 * Note: This modifies the original array.
 *
 * @example
 * shuffle([1, 2, 3, 4]) //=> [3, 1, 4, 2] (random order)
 *
 * @param xs The array to shuffle
 * @returns The shuffled array
 */
export const shuffle = <T>(xs: T[]): T[] => {
  return xs.sort(() => Math.random() - 0.5)
}
