export type Result<TError, TValue> = Err<TError> | Ok<TValue>;

export type Ok<T> = { t: "ok"; value: T };

export type Err<T> = { t: "err"; error: T };

export const Ok = <T>(value: T): Ok<T> => {
  return { t: "ok", value };
};

export const Err = <T>(error: T): Err<T> => {
  return { t: "err", error };
};

const map =
  <TError, A, B>(mapper: (a: A) => B) =>
  (result: Result<TError, A>): Result<TError, B> => {
    switch (result.t) {
      case "err":
        return result;

      case "ok":
        return Ok(mapper(result.value));
    }
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

const map_ = <TError, A, B>(
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
  map,
  map_,
  mapErr,
  fromNullable,
  withDefault,
  combine,
};
