import { Result, ok } from "./result"

export type Task<TErr, TVal> = Promise<Result<TErr, TVal>>

const andThen = async <TErr, TVal>(
  task: Task<TErr, TVal>,
  ...functions: ((val: TVal) => Task<TErr, TVal>)[]
): Task<TErr, TVal> => {
  const result = await task

  if (result.t === "err") {
    return result
  }

  let acc = result.value

  for (const fn of functions) {
    const nextResult = await fn(acc)

    if (nextResult.t === "err") {
      return nextResult
    }

    acc = nextResult.value
  }

  return ok(acc)
}

export const Task = {
  andThen,
}
