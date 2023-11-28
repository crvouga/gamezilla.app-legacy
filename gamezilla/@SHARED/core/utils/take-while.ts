/**
 * Takes elements from the start of the array while the predicate returns true.
 * @example
 * const isNeg = (x) => x < 0;
 * takeWhile([-2, -1, 0, 1, 2], isNeg); //=> [-2, -1]
 * takeWhile([-2, -1], isNeg); //=> [-2, -1]
 * takeWhile([1, 2, 3], isNeg); //=> []
 * takeWhile([], isNeg); //=> []
 */
export const takeWhile = <T>(
  arr: Iterable<T>,
  predicate: (item: T) => boolean
): T[] => {
  const results: T[] = [];

  for (const item of arr) {
    if (!predicate(item)) {
      break;
    }
    results.push(item);
  }
  return results;
};
