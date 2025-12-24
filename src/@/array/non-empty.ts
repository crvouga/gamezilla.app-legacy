import { Err, Ok, Result, unwrap } from '../result'

/**
 * Type representing a non-empty array - an array with at least one element
 */
export type NonEmpty<T> = [T, ...T[]]

/**
 * Checks if an array is non-empty
 *
 * @example
 * NonEmpty.is([1, 2, 3]) // true
 * NonEmpty.is([]) // false
 */
const is = <T>(x: T[]): x is NonEmpty<T> => {
  return Array.isArray(x) && x.length > 0
}

/**
 * Gets the last element of a non-empty array
 *
 * @example
 * NonEmpty.last([1, 2, 3]) // 3
 */
const last = <T>(xs: NonEmpty<T>): T => {
  const lastEl = xs[xs.length - 1]

  if (!lastEl) {
    throw new Error('Impossible condition! NonEmpty array has no last element!')
  }

  return lastEl
}

/**
 * Maps a function over a non-empty array, preserving non-emptiness
 *
 * @example
 * NonEmpty.map([1, 2, 3], x => x * 2) // [2, 4, 6]
 */
const map = <T, U>(xs: NonEmpty<T>, f: (x: T) => U): NonEmpty<U> => {
  return [f(xs[0]), ...xs.slice(1).map(f)]
}

/**
 * Concatenates multiple non-empty arrays into a single non-empty array
 *
 * @example
 * NonEmpty.concat([1, 2], [3, 4], [5]) // [1, 2, 3, 4, 5]
 */
const concat = <T>(...arrays: NonEmpty<NonEmpty<T>>): NonEmpty<T> => {
  const empty: T[] = []
  const concatenated = empty.concat(...arrays)
  return concatenated as NonEmpty<T>
}

/**
 * Appends an element to a non-empty array
 *
 * @example
 * NonEmpty.append(4, [1, 2, 3]) // [1, 2, 3, 4]
 */
const append = <T>(x: T, xs: NonEmpty<T>): NonEmpty<T> => {
  return [...xs, x]
}

/**
 * Prepends an element to a non-empty array
 *
 * @example
 * NonEmpty.prepend(0, [1, 2, 3]) // [0, 1, 2, 3]
 */
const prepend = <T>(x: T, xs: NonEmpty<T>): NonEmpty<T> => {
  return [x, ...xs]
}

/**
 * Asserts that an array is non-empty, throwing if it's empty
 *
 * @example
 * NonEmpty.assert([1, 2, 3]) // [1, 2, 3]
 * NonEmpty.assert([]) // throws Error
 */
const assert = <T>(xs: T[]): NonEmpty<T> => {
  return unwrap(init(xs))
}

/**
 * Attempts to initialize a non-empty array from the given array.
 * Returns an Ok(NonEmpty<T>) if the array is non-empty,
 * otherwise returns an Err(Error).
 *
 * @example
 * NonEmpty.init([1, 2, 3]) // Ok([1, 2, 3])
 * NonEmpty.init([]) // Err(Error)
 *
 * @param xs - The array to convert to a NonEmpty array
 * @returns A Result containing either an Error or a NonEmpty<T> array
 */
const init = <T>(xs: T[]): Result<Error, NonEmpty<T>> => {
  if (!is(xs)) {
    return Err(new Error('Assertion failed: NonEmpty array has no elements'))
  }
  return Ok(xs)
}

export const NonEmpty = {
  assert,
  init,
  concat,
  is,
  last,
  map,
  append,
  prepend,
}
