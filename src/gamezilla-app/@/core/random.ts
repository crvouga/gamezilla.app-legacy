// source: https://stackoverflow.com/questions/16801687/javascript-random-ordering-with-seed

import { Iter } from './iter'

const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cyrb128 = (seed: string) => {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0, k; i < seed.length; i++) {
    k = seed.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0]
}

const generator = (seed: string) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return mulberry32(cyrb128(seed)[0]!)
}

/**
 * @description
 * returns a random permutation of the inputted array
 * @link
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @example
 *
 * const x = ['a', 'b', 'c']
 * shuffle("some seed", x) //=> ['b', 'a', 'c']
 * shuffle("some seed", x) //=> ['b', 'a', 'c']
 * shuffle("different seed", x) //=> ['c', 'a', 'b']
 */
const shuffle = <T>(seed: string, xs: Iterable<T>): Iter<T> => {
  const random = generator(seed)
  const ys = [...xs]
  for (let i = ys.length - 1; i >= 0; i--) {
    const j = Math.floor(random() * i)
    const temp = ys[i]
    // @ts-expect-error
    ys[i] = ys[j]
    // @ts-expect-error
    ys[j]! = temp
  }
  return Iter.init(ys)
}

export const Random = {
  generator,
  shuffle
}
