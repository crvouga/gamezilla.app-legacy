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
export const memoize = <TInput, TOutput>(
  toKey: (x: TInput) => string | number,
  func: (x: TInput) => TOutput
) => {
  const cache = new Map<string | number, TOutput>();
  
  return (x: TInput): TOutput => {
    const key = toKey(x);
  
    const cached = cache.get(key);
  
    if (cached) {
      return cached;
    }
  
    const y = func(x);
  
    cache.set(key, y);
  
    return y;
  };
};
