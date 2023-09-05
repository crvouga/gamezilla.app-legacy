export type Result<TError, TValue> = Err<TError> | Ok<TValue>;

export type Ok<T> = { t: "ok"; value: T };

export type Err<T> = { t: "err"; error: T };

export const Ok = <T>(value: T): Ok<T> => {
  return { t: "ok", value };
};

export const Err = <T>(error: T): Err<T> => {
  return { t: "err", error };
};

const mapErr =
  <A, B, TValue>(mapper: (a: A) => B) =>
  (result: Result<A, TValue>): Result<B, TValue> => {
    switch (result.t) {
      case "err":
        return Err(mapper(result.error));

      case "ok":
        return result;
    }
  };

const fromNullable =
  <TError, TValue>(err: TError) =>
  (value: TValue | undefined | null): Result<TError, TValue> => {
    if (value === undefined) {
      return Err(err);
    }

    if (value === null) {
      return Err(err);
    }

    return Ok(value);
  };

const withDefault =
  <T>(fallback: T) =>
  (result: Result<unknown, T>): T => {
    switch (result.t) {
      case "err":
        return fallback;

      case "ok":
        return result.value;
    }
  };

/**
 * Combines an array of results into a single result.
 * If any of the results are an error, the first error is returned.
 */
const combine = <E, A>(results: Result<E, A>[]): Result<E, A[]> => {
  return results.reduce<Result<E, A[]>>((combined, result) => {
    if (combined.t === "err") {
      return combined;
    }

    if (result.t === "err") {
      return result;
    }
    return Ok([...combined.value, result.value]);
  }, Ok([]));
};

const mapOk = <TError, A, B>(
  result: Result<TError, A>,
  mapper: (a: A) => B
): Result<TError, B> => {
  if (result.t === "ok") {
    return Ok(mapper(result.value));
  }
  return result;
};

export const Result = {
  Ok,
  Err,
  mapOk,
  mapErr,
  fromNullable,
  withDefault,
  combine,
};
