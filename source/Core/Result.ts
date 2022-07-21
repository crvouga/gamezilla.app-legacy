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

export const map =
  <TError, A, B>(mapper: (a: A) => B) =>
  (result: Result<TError, A>): Result<TError, B> => {
    switch (result.type) {
      case "Err":
        return result

      case "Ok":
        return Ok(mapper(result.value))
    }
  }

export const mapError =
  <A, B, TValue>(mapper: (a: A) => B) =>
  (result: Result<A, TValue>): Result<B, TValue> => {
    switch (result.type) {
      case "Err":
        return Err(mapper(result.error))

      case "Ok":
        return result
    }
  }

export const fromNullable =
  <TError, TValue>(err: TError) =>
  (value: TValue | undefined | null): Result<TError, TValue> => {
    if (value === undefined) {
      return Err(err)
    }

    if (value === null) {
      return Err(err)
    }

    return Ok(value)
  }

export const withDefault =
  <T>(fallback: T) =>
  (result: Result<unknown, T>): T => {
    switch (result.type) {
      case "Err":
        return fallback

      case "Ok":
        return result.value
    }
  }
