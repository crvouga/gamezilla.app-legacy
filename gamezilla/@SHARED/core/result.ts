/**
 * A `Result` represents the result of an operation that may succeed or fail.
 */
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
 * `Err<T>` represents a failed result
 */
export const err = <T>(error: T): Err<T> => {
  return { t: "err", error };
};

export const isErr = <TError, TValue>(
  result: Result<TError, TValue>
): result is Err<TError> => {
  return result.t === "err";
};

export const isOk = <TError, TValue>(
  result: Result<TError, TValue>
): result is Ok<TValue> => {
  return result.t === "ok";
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
 * @example
 * const results = [ok(1), ok(2), ok(3)];
 * const result = combine(results);
 * // result = ok([1, 2, 3]);
 * @example
 * const results = [ok(1), err("error"), ok(3)];
 * const result = combine(results);
 * // result = err("error");
 */
const combine = <E, A>(results: Result<E, A>[]): Result<E, A[]> => {
  const values: A[] = [];
  for (const result of results) {
    if (result.t === "err") {
      return result;
    }
    values.push(result.value);
  }
  return ok(values);
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
