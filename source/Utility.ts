import { pipe } from "fp-ts/lib/function"
import { cmd } from "Core"
import { Cmd } from "Core/Cmd"

export const exhaustive = (
  discriminatedUnionType: "Missing Case Error",
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`)
}

export type Group<GroupName extends string, Msg> = {
  group: GroupName
} & Msg

export const groupTag =
  <Msg, GroupName extends string>(group: GroupName) =>
  (msg: Msg): Group<GroupName, Msg> => {
    return { ...msg, group: group } as const
  }

export const andThen =
  <Msg, Model, Action>(
    update: (
      msg: Msg,
      model: Model,
    ) => [Model, Cmd<Msg>] | [Model, Cmd<Msg>, Action[]],
    msg: Msg,
  ) =>
  ([model, cmdPrev, actionsPrev = []]:
    | [Model, Cmd<Msg>]
    | [Model, Cmd<Msg>, Action[]]): [Model, Cmd<Msg>, Action[]] => {
    const [modelNew, cmdNew, actionsNew = []] = update(msg, model)

    return [
      modelNew,
      cmd.batch([cmdPrev, cmdNew]),
      [...actionsPrev, ...(actionsNew ?? [])],
    ]
  }

export const andThenMany =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msgs: Msg[],
  ) =>
  ([modelPrev, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [msg, ...msgsRest] = msgs

    if (!msg) {
      return [modelPrev, cmdPrev]
    }

    const [modelNew, cmdNew] = update(msg, modelPrev)

    return pipe(
      [modelNew, cmd.batch([cmdPrev, cmdNew])],
      andThenMany(update, msgsRest),
    )
  }

/**
 *
 *
 *
 * debounce
 *
 *
 *
 */

export type Options<Result> = {
  isImmediate?: boolean
  maxWait?: number
  callback?: (data: Result) => void
}

export interface DebouncedFunction<
  Args extends any[],
  F extends (...args: Args) => any,
> {
  (this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<
    ReturnType<F>
  >
  cancel: (reason?: any) => void
}

interface DebouncedPromise<FunctionReturn> {
  resolve: (result: FunctionReturn) => void
  reject: (reason?: any) => void
}

export function debounce<Args extends any[], F extends (...args: Args) => any>(
  func: F,
  waitMilliseconds = 50,
  options: Options<ReturnType<F>> = {},
): DebouncedFunction<Args, F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const isImmediate = options.isImmediate ?? false
  const callback = options.callback ?? false
  const maxWait = options.maxWait
  let lastInvokeTime = Date.now()

  let promises: DebouncedPromise<ReturnType<F>>[] = []

  function nextInvokeTimeout() {
    if (maxWait !== undefined) {
      const timeSinceLastInvocation = Date.now() - lastInvokeTime

      if (timeSinceLastInvocation + waitMilliseconds >= maxWait) {
        return maxWait - timeSinceLastInvocation
      }
    }

    return waitMilliseconds
  }

  const debouncedFunction = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    const context = this
    return new Promise<ReturnType<F>>((resolve, reject) => {
      const invokeFunction = function () {
        timeoutId = undefined
        lastInvokeTime = Date.now()
        if (!isImmediate) {
          const result = func.apply(context, args)
          callback && callback(result)
          promises.forEach(({ resolve }) => resolve(result))
          promises = []
        }
      }

      const shouldCallNow = isImmediate && timeoutId === undefined

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(invokeFunction, nextInvokeTimeout())

      if (shouldCallNow) {
        const result = func.apply(context, args)
        callback && callback(result)
        return resolve(result)
      }
      promises.push({ resolve, reject })
    })
  }

  debouncedFunction.cancel = function (reason?: any) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    promises.forEach(({ reject }) => reject(reason))
    promises = []
  }

  return debouncedFunction
}

/**
 *
 *
 *
 * source: https://www.tutorialspoint.com/levenshtein-distance-in-javascript
 *
 *
 */

export const editDistance = (str1 = "", str2 = ""): number => {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    // @ts-ignore
    track[0][i] = i
  }
  for (let j = 0; j <= str2.length; j += 1) {
    // @ts-ignore
    track[j][0] = j
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1

      // @ts-ignore
      track[j][i] = Math.min(
        // @ts-ignore
        track[j][i - 1] + 1, // deletion
        // @ts-ignore
        track[j - 1][i] + 1, // insertion
        // @ts-ignore
        track[j - 1][i - 1] + indicator, // substitution
      )
    }
  }
  // @ts-ignore
  return track[str2.length][str1.length]
}

export const sort = <T>(compare: (a: T, b: T) => number, items: T[]): T[] => {
  const ret = [...items]

  ret.sort(compare)

  return ret
}

export const ascend =
  <T>(keyFn: (a: T) => number) =>
  (a: T, b: T): number => {
    const aa = keyFn(a)
    const bb = keyFn(b)
    return aa < bb ? -1 : aa > bb ? 1 : 0
  }

export const descend =
  <T>(keyFn: (a: T) => number) =>
  (a: T, b: T): number => {
    const aa = keyFn(a)
    const bb = keyFn(b)
    return aa < bb ? -1 : aa > bb ? 1 : 0
  }
