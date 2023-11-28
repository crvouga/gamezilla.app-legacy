/**
 * @description
 * optimization for expensive function calls by caching results
 *
 * @example
 * // O(n^2) time complexity
 * const fibonacci = (n) =>
 *   n <= 1 ? 1 : fibonacci(n - 1) + fibonacci(n - 2)
 *
 * // O(n) time complexity
 * const memoizedFibonacci = memoize(fibonacci)
 *
 */
export const memoize = <X, Y>(
  toKey: (x: X) => string | number,
  f: (x: X) => Y
) => {
  const cache = new Map<string | number, Y>();
  return (x: X): Y => {
    const key = toKey(x);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const y = f(x);
    cache.set(key, y);
    return y;
  };
};
