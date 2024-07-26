export type NonEmpty<T> = [T, ...T[]]

const is = <T>(x: T[]): x is NonEmpty<T> => {
  return Array.isArray(x) && x.length > 0
}

const last = <T>(xs: NonEmpty<T>): T => {
  const lastEl = xs[xs.length - 1]

  if (!lastEl) {
    throw new Error('Impossible condition! NonEmpty array has no last element!')
  }

  return lastEl
}

const map = <T, U>(xs: NonEmpty<T>, f: (x: T) => U): NonEmpty<U> => {
  return [f(xs[0]), ...xs.slice(1).map(f)]
}

const concat = <T>(...arrays: NonEmpty<NonEmpty<T>>): NonEmpty<T> => {
  const empty: T[] = []
  const concatenated = empty.concat(...arrays)
  return concatenated as NonEmpty<T>
}

const append = <T>(x: T, xs: NonEmpty<T>): NonEmpty<T> => {
  return [...xs, x]
}

const prepend = <T>(x: T, xs: NonEmpty<T>): NonEmpty<T> => {
  return [x, ...xs]
}

export const NonEmpty = {
  concat,
  is,
  last,
  map,
  append,
  prepend
}
