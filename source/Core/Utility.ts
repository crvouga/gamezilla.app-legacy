import * as Cmd from "./Cmd"
import { p } from "./pipe"
import * as Sub from "./Sub"

export const exhaustive = (
  discriminatedUnionType: "Missing Case!",
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`)
}

export const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
    msg: Msg,
  ) =>
    ([model, cmdPrev]: [Model, Cmd.Cmd<Msg>]): [Model, Cmd.Cmd<Msg>] => {
      const [modelNew, cmdNew] = update(msg, model)

      return [modelNew, Cmd.batch([cmdNew, cmdPrev])]
    }

export const andThenMany =
  <Action, Model, Msg>(
    update: (msg: Action, model: Model) => [Model, Cmd.Cmd<Msg>],
    msgs: Action[],
  ) =>
    ([modelPrev, cmdPrev]: [Model, Cmd.Cmd<Msg>]): [Model, Cmd.Cmd<Msg>] => {
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

export const tagUpdate = <TagName extends string, Model, Msg>(
  tagName: TagName,
  [model, cmd]: [Model, Cmd.Cmd<Msg>],
): [[TagName, Model], Cmd.Cmd<[TagName, Msg]>] => {
  return [
    [tagName, model],
    p(
      cmd,
      Cmd.map((msg) => [tagName, msg]),
    ),
  ]
}

export const tagCmd = <TagName extends string, Msg>(
  tagName: TagName,
  cmd: Cmd.Cmd<Msg>,
): Cmd.Cmd<[TagName, Msg]> => {
  return p(cmd, Cmd.map(t(tagName)))
}

export const tagSub = <TagName extends string, Msg>(
  tagName: TagName,
  sub: Sub.Sub<Msg>,
): Sub.Sub<[TagName, Msg]> => {
  return p(sub, Sub.map(t(tagName)))
}

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
export const unique = <X,>(eq: (a: X, b: X) => boolean, xs: X[]): X[] => {
  const items: X[] = []

  for (const x of xs) {
    if (!items.some(item => eq(item, x))) {
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
export const isSubset = <X,>(eq: (x1: X, x2: X) => boolean, a: X[], b: X[]): boolean =>
  a.every((a_i) => b.some((b_i) => eq(a_i, b_i)))


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