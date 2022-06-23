export type Result<TError, TValue> = Err<TError> | Ok<TValue>

export type Ok<T> = { type: "Ok"; value: T }

export type Err<T> = { type: "Err"; error: T }

export const Ok = <T>(value: T): Ok<T> => {
  return { type: "Ok", value }
}

export const Err = <T>(error: T): Err<T> => {
  return { type: "Err", error }
}

export const fold =
  <TError, TValue, T>(
    onErr: (error: TError) => T,
    onValue: (value: TValue) => T,
  ) =>
  (result: Result<TError, TValue>): T => {
    if (result.type === "Ok") {
      return onValue(result.value)
    }

    return onErr(result.error)
  }
