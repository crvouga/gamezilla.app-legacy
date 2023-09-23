export type Result<TError, TValue> = Err<TError> | Ok<TValue>;

export type Ok<T> = { t: "ok"; value: T };

export type Err<T> = { t: "err"; error: T };

/**
 * `Ok<T>` represents a successful result
 */
export const ok = <T>(value: T): Ok<T> => {
  return { t: "ok", value };
};

/**
 * `Err<T>` represents a failed result asa
 */
export const err = <T>(error: T): Err<T> => {
  return { t: "err", error };
};

const mapErr =
  <A, B, TValue>(mapper: (a: A) => B) =>
  (result: Result<A, TValue>): Result<B, TValue> => {
    switch (result.t) {
      case "err":
        return err(mapper(result.error));

      case "ok":
        return result;
    }
  };

const fromNullable =
  <TError, TValue>(error: TError) =>
  (value: TValue | undefined | null): Result<TError, TValue> => {
    if (value === undefined) {
      return err(error);
    }

    if (value === null) {
      return err(error);
    }

    return ok(value);
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
    return ok([...combined.value, result.value]);
  }, ok([]));
};

const mapOk = <TError, A, B>(
  result: Result<TError, A>,
  mapper: (a: A) => B
): Result<TError, B> => {
  if (result.t === "ok") {
    return ok(mapper(result.value));
  }
  return result;
};

export const Result = {
  ok,
  err,
  mapOk,
  mapErr,
  fromNullable,
  withDefault,
  combine,
};
