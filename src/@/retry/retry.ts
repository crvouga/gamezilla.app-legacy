import { Err, isOk, Result } from '../result'
import { TimeSpan } from '../time/time-span'
import { BackoffFunction } from './backoff-functions'

export type Config<TError, TOk> = {
  maxAttempts: number
  backoffFunction: BackoffFunction
  fn: (state: { attempt: number; errors: TError[] }) => MaybePromise<Result<TError, TOk>>
}

type MaybePromise<T> = Promise<T> | T

export const Retry = <TError, TOk>(config: Config<TError, TOk>): Promise<Result<TError[], TOk>> => {
  const tryFn = async (attempt: number, errors: TError[]): Promise<Result<TError[], TOk>> => {
    if (attempt >= config.maxAttempts) {
      return Err(errors)
    }

    const delay = config.backoffFunction({ attempt, maxAttempts: config.maxAttempts })

    const result = await config.fn({
      attempt,
      errors,
    })

    if (isOk(result)) {
      return result
    }

    await sleep(delay)

    return tryFn(attempt + 1, [...errors, result.error])
  }

  return tryFn(0, [])
}

const sleep = (delay: TimeSpan) => new Promise((resolve) => setTimeout(resolve, TimeSpan.toMilliseconds(delay)))
