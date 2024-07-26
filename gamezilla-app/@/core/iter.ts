import type { NonNegInt } from './num'

export type Iter<T> = Iterable<T> & {
  Iter: 'Iter'
}

const init = <T>(iterable: Iterable<T>): Iter<T> => {
  return {
    Iter: 'Iter',
    [Symbol.iterator]: function* () {
      for (const element of iterable) {
        yield element
      }
    }
  }
}

const take = <T>(n: NonNegInt, iter: Iter<T>): Iter<T> => {
  return init({
    [Symbol.iterator]: function* () {
      let i = 0
      for (const element of iter) {
        if (i >= n._value) {
          break
        }
        yield element
        i++
      }
    }
  })
}

const drop = <T>(n: NonNegInt, iter: Iter<T>): Iter<T> => {
  return init({
    [Symbol.iterator]: function* () {
      let i = 0
      for (const element of iter) {
        if (i >= n._value) {
          yield element
        }
        i++
      }
    }
  })
}

export const Iter = {
  init,
  take,
  drop
}
