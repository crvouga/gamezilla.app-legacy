import { Cmd } from "./cmd"
import { p } from "./pipe"

export const exhaustive = (discriminatedUnionType: "Missing Case!"): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`)
}

export const andThen_ =
  <Msg, Model>(
    msg: Msg,
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
  ) =>
    ([model, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
      const [modelNew, cmdNew] = update(msg, model)

      return [modelNew, Cmd.batch([cmdNew, cmdPrev])]
    }

export const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msg: Msg,
  ) =>
    ([model, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
      const [modelNew, cmdNew] = update(msg, model)

      return [modelNew, Cmd.batch([cmdNew, cmdPrev])]
    }

export const andThenMany =
  <Action, Model, Msg>(
    update: (msg: Action, model: Model) => [Model, Cmd<Msg>],
    msgs: Action[],
  ) =>
    ([modelPrev, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
      const [msg, ...msgsRest] = msgs

      if (!msg) {
        return [modelPrev, cmdPrev]
      }

      const [modelNew, cmdNew] = update(msg, modelPrev)

      return p(
        [modelNew, Cmd.batch([cmdPrev, cmdNew])],
        andThenMany(update, msgsRest),
      )
    }

export const t =
  <Tag extends string>(tag: Tag) =>
    <Value>(value: Value): [Tag, Value] =>
      [tag, value]


export type Unit = { type: "Unit" }

export const Unit: Unit = { type: "Unit" }

type Range = [number, number]
/**
 * @example
 * // assume a ∈ [0, 100]
 * const a = 10
 * const b = rescale({ value: a, from: [0, 100], to: [0, 10] }) //=> 1
 */
export const rescale = ({
  value,
  from,
  to,
}: {
  value: number
  from: Range
  to: Range
}) => {
  return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0]
}

/**
 * @example
 * const strEq = (s1, s2) => String(s1) === String(s2)
 * unique(strEq, [1, '1', 2, 1]) //=> [1, 2]
 * unique(strEq, [{}, {}])       //=> [{}]
 * unique(strEq, [1, '1', 1])    //=> [1]
 * unique(strEq, ['1', 1, 1])    //=> ['1']
 */
export const unique = <X>(eq: (a: X, b: X) => boolean, xs: X[]): X[] => {
  const items: X[] = []

  for (const x of xs) {
    if (!items.some((item) => eq(item, x))) {
      items.push(x)
    }
  }

  return items
}

/**
 * @example
 * const eq = (a, b) => a === b
 * isSubset(eq, [], []) //=> true
 * isSubset(eq, [], ['a']) //=> true
 * isSubset(eq, ['a'], ['a']) //=> true
 * isSubset(eq, ['a'], ['a', 'b']) //=> true
 * isSubset(eq, ['a'], []) //=> false
 * isSubset(eq, ['a', 'b'], ['a']) //=> false
 */
export const isSubset = <X>(
  eq: (x1: X, x2: X) => boolean,
  a: X[],
  b: X[],
): boolean => a.every((a_i) => b.some((b_i) => eq(a_i, b_i)))

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
export const memoize = <X, Y>(toKey: (x: X) => string, f: (x: X) => Y) => {
  const cache = new Map<string, Y>()
  return (x: X): Y => {
    const key = toKey(x)
    const cached = cache.get(key)
    if (cached) {
      return cached
    }
    const y = f(x)
    cache.set(key, y)
    return y
  }
}

/**
 * @description
 * returns a random permutation of the inputted array
 * @link
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @example
 * const x = ['a', 'b', 'c']
 * shuffle(x) //=> ['b', 'a', 'c']
 * shuffle(x) //=> ['a', 'c', 'b']
 * shuffle(x) //=> ['c', 'a', 'b']
 */
export const shuffle = <X>(xs: X[]): X[] => {
  const ys = [...xs]
  for (let i = ys.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = ys[i]!
    ys[i]! = ys[j]!
    ys[j]! = temp
  }
  return ys
}

export const removeKey = <T>(key: keyof T, obj: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = obj
  return rest
}

type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

export const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
): T => {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(predicate),
  ) as T
}
