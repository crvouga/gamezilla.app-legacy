//
//
//
//
//
//

/**
 * A `Result` represents the result of an operation that may succeed or fail.
 */
export type ResultPrivate<TError, TValue> = Err<TError> | Ok<TValue>;

export type Ok<T> = { readonly t: "ok"; readonly value: T };

export type Err<T> = { readonly t: "err"; readonly error: T };

const is = <TError, TValue>(
	isErr: (x: unknown) => x is TError,
	isOk: (x: unknown) => x is TValue,
): ((x: unknown) => x is ResultPrivate<TError, TValue>) => {
	return (x): x is ResultPrivate<TError, TValue> => {
		if (x === undefined) {
			return false;
		}

		if (x === null) {
			return false;
		}

		if (typeof x !== "object") {
			return false;
		}

		if ("t" in x === false) {
			return false;
		}

		if (x.t === "err") {
			return isErr((x as Err<TError>).error);
		}

		if (x.t === "ok") {
			return isOk((x as Ok<TValue>).value);
		}

		return false;
	};
};

/**
 * Unwraps a result, throwing an error if the result is an error.
 */
export const unwrap = <TError, TValue>(
	result: ResultPrivate<TError, TValue>,
): TValue => {
	switch (result.t) {
		case "ok":
			return result.value;

		case "err":
			throw new Error(
				`Tried to unwrap an error result. ${String(result.error)}`,
			);
	}
};

/**
 * `Ok<T>` represents a successful result
 */
export const Ok = <T>(value: T): Ok<T> => {
	return { t: "ok", value };
};

/**
 * `Err<T>` represents a failed result
 */
export const Err = <T>(error: T): Err<T> => {
	return { t: "err", error };
};

/**
 * Checks if a result is an error
 */
export const isErr = <TError, TValue>(
	result: RemoteResultPrivate<TError, TValue>,
): result is Err<TError> => {
	return result.t === "err";
};

export const isOk = <TError, TValue>(
	result: ResultPrivate<TError, TValue>,
): result is Ok<TValue> => {
	return result.t === "ok";
};

const mapErr = <A, B, TValue>(
	result: ResultPrivate<A, TValue>,
	mapper: (a: A) => B,
): ResultPrivate<B, TValue> => {
	switch (result.t) {
		case "err":
			return Err(mapper(result.error));

		case "ok":
			return result;
	}
};

const fromNullable =
	<TError, TValue>(error: TError) =>
	(value: TValue | undefined | null): ResultPrivate<TError, TValue> => {
		if (value === undefined) {
			return Err(error);
		}

		if (value === null) {
			return Err(error);
		}

		return Ok(value);
	};

const withDefault = <T>(result: ResultPrivate<unknown, T>, fallback: T) => {
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
const combine = <E, A>(
	results: ResultPrivate<E, A>[],
): ResultPrivate<E, A[]> => {
	const values: A[] = [];
	for (const result of results) {
		if (isErr(result)) {
			return result;
		}
		values.push(result.value);
	}
	return Ok(values);
};

const mapOk = <TError, A, B>(
	result: ResultPrivate<TError, A>,
	mapper: (a: A) => B,
): ResultPrivate<TError, B> => {
	switch (result.t) {
		case "err":
			return result;
		case "ok":
			return Ok(mapper(result.value));
	}
};

export const ResultPrivate = {
	is,
	Ok,
	Err,
	mapOk,
	mapErr,
	fromNullable,
	withDefault,
	combine,
	unwrap,
};

//
//
//
//
//
//
//
//

export const NotAsked: NotAsked = { t: "not-asked" };

export type NotAsked = {
	t: "not-asked";
};

export const Loading: Loading = { t: "loading" };

export type Loading = {
	t: "loading";
};

export type Remote = NotAsked | Loading;

export type RemoteResultPrivate<TError, TValue> =
	| Remote
	| ResultPrivate<TError, TValue>;

export const isLoading = <TError, TValue>(
	result?: RemoteResultPrivate<TError, TValue>,
): result is Loading => {
	return result?.t === "loading";
};

export const isNotAsked = <TError, TValue>(
	result: RemoteResultPrivate<TError, TValue>,
): result is NotAsked => {
	return result.t === "not-asked";
};

export const isPending = <TError, TValue>(
	result: RemoteResultPrivate<TError, TValue>,
): result is NotAsked | Loading => {
	return isNotAsked(result) || isLoading(result);
};

export const remoteResultMap = <E, A, B>(
	result: RemoteResultPrivate<E, A>,
	mapper: (a: A) => B,
): RemoteResultPrivate<E, B> => {
	switch (result.t) {
		case "not-asked":
		case "loading":
			return result;

		case "err":
		case "ok":
			return ResultPrivate.mapOk(result, mapper);
	}
};

export const RemoteResultPrivate = {
	map: remoteResultMap,
	Loading,
	NotAsked,
	Err,
	Ok,
	is,
};
