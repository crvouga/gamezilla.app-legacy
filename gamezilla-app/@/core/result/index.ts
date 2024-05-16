import { ResultPrivate, RemoteResultPrivate } from "./result";
import { parser } from "./result-parser";
export * from "./result";
export * from "./result-parser";
export type { ResultPrivate } from "./result";

export type Result<TError, TValue> = ResultPrivate<TError, TValue>;

export const Result = {
	parser,
	...ResultPrivate,
};

export type RemoteResult<TError, TValue> = RemoteResultPrivate<TError, TValue>;

export const RemoteResult = {
	...RemoteResultPrivate,
};
