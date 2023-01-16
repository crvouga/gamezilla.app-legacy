export type Result<TError, TValue> = Err<TError> | Ok<TValue>

export type Ok<T> = { type: "Ok"; value: T }

export type Err<T> = { type: "Err"; error: T }

export const Ok = <T>(value: T): Ok<T> => {
  return { type: "Ok", value }
}

export const Err = <T>(error: T): Err<T> => {
  return { type: "Err", error }
}

const map =
  <TError, A, B>(mapper: (a: A) => B) =>
  (result: Result<TError, A>): Result<TError, B> => {
    switch (result.type) {
      case "Err":
        return result

      case "Ok":
        return Ok(mapper(result.value))
    }
  }

const mapErr =
  <A, B, TValue>(mapper: (a: A) => B) =>
  (result: Result<A, TValue>): Result<B, TValue> => {
    switch (result.type) {
      case "Err":
        return Err(mapper(result.error))

      case "Ok":
        return result
    }
  }

const fromNullable =
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

const withDefault =
  <T>(fallback: T) =>
  (result: Result<unknown, T>): T => {
    switch (result.type) {
      case "Err":
        return fallback

      case "Ok":
        return result.value
    }
  }

const combine = <E, A>(results: Result<E, A>[]): Result<E, A[]> => {
  return results.reduce<Result<E, A[]>>((combined, result) => {
    if (combined.type === "Err") {
      return combined
    }

    if (result.type === "Err") {
      return result
    }
    return Ok([...combined.value, result.value])
  }, Ok([]))
}

export const Result = {
  Ok,
  Err,
  map,
  mapErr,
  fromNullable,
  withDefault,
  combine,
}
