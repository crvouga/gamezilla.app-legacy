import type { Brand } from "../../brand";
import { Err, Ok } from "../../result/result";
import type { Parser, ParserError } from "./parser-types";

const errorToString = (error: ParserError): string => {
	return error.path.join(".") + ": " + error.message;
};

export const errorsToString = (errors: ParserError[]): string => {
	return errors.map(errorToString).join("\n");
};

const toErrorMessage = (
	expected: string,
	actual: string,
	actualValue: string,
) => {
	return `Expected: ${expected}.\nActual Type: ${actual}.\nActual Value: ${actualValue}\n`;
};

export const is =
	<T>(parser: Parser<T>) =>
	(input: unknown): input is T => {
		return parser.parse(input).t === "ok";
	};

export const noop = <T>(): Parser<T> => {
	return {
		parse(input) {
			return Ok(input as T);
		},
	};
};
//
//
//
//
//
//

const isIndexable = (input: unknown): input is Record<string, unknown> => {
	return typeof input === "object" && input !== null;
};

export const obj = <T>(
	parsers: {
		[K in keyof T]: Parser<T[K]>;
	},
): Parser<T> => {
	return {
		parse(input) {
			if (typeof input !== "object") {
				return Err([
					{
						message: toErrorMessage(
							"object",
							typeof input,
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			if (input === null) {
				return Err([
					{
						message: toErrorMessage("object", "null", JSON.stringify(input)),
						path: [],
					},
				]);
			}

			if (!isIndexable(input)) {
				return Err([
					{
						message: toErrorMessage(
							"object",
							"non-indexable",
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			const result: Partial<T> = {};
			const errors: ParserError[] = [];
			for (const key in parsers) {
				const parser = parsers[key];

				const value = input[key];

				const parsed = parser.parse(value);

				if (parsed.t === "ok") {
					result[key] = parsed.value;
					continue;
				}

				errors.push(
					...parsed.error.map((err): ParserError => {
						return {
							message: err.message,
							path: [key, ...err.path],
						};
					}),
				);
			}

			if (errors.length > 0) {
				return Err(errors);
			}

			return Ok(result as T);
		},
	};
};

export const str: Parser<string> = {
	parse(input) {
		if (typeof input !== "string") {
			return Err([
				{
					message: toErrorMessage(
						"string",
						typeof input,
						`${input instanceof Date}, ${JSON.stringify(input)}`,
					),
					path: [],
				},
			]);
		}
		return Ok(input);
	},
};

export const num: Parser<number> = {
	parse(input) {
		if (typeof input !== "number") {
			return Err([
				{
					message: toErrorMessage(
						"number",
						typeof input,
						JSON.stringify(input),
					),
					path: [],
				},
			]);
		}
		return Ok(input);
	},
};

export const l = <T extends string | number | boolean | null | undefined>(
	value: T,
): Parser<T> => {
	return {
		parse(input) {
			if (input !== value) {
				return Err([
					{
						message: toErrorMessage(
							String(value),
							String(input),
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}
			return Ok(value);
		},
	};
};

export const arr = <T>(parser: Parser<T>): Parser<T[]> => {
	return {
		parse(input) {
			if (!Array.isArray(input)) {
				return Err([
					{
						message: toErrorMessage(
							"array",
							typeof input,
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			const result: T[] = [];
			const errors: ParserError[] = [];
			for (let i = 0; i < input.length; i++) {
				const value = input[i];
				const parsed = parser.parse(value);
				if (parsed.t === "ok") {
					result.push(parsed.value);
					continue;
				}
				errors.push(
					...parsed.error.map((err): ParserError => {
						return {
							message: err.message,
							path: [String(i), ...err.path],
						};
					}),
				);
			}

			if (errors.length > 0) {
				return Err(errors);
			}

			return Ok(result);
		},
	};
};

export const maybe = <T>(parser: Parser<T>): Parser<T | null | undefined> => {
	return {
		parse(input) {
			if (input === null || input === undefined) {
				return Ok(null);
			}
			return parser.parse(input);
		},
	};
};

export const dict = <TKey extends string | number, TValue>(
	key: Parser<TKey>,
	value: Parser<TValue>,
): Parser<{ [key in TKey]: TValue }> => {
	return {
		parse(input) {
			if (!isIndexable(input)) {
				return Err([
					{
						message: toErrorMessage(
							"object",
							typeof input,
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			const result = {} as Record<TKey, TValue>;
			const errors: ParserError[] = [];
			for (const k in input) {
				const keyParsed = key.parse(k);
				if (keyParsed.t === "err") {
					errors.push(
						...keyParsed.error.map((err): ParserError => {
							return {
								message: err.message,
								path: [k, ...err.path],
							};
						}),
					);
					continue;
				}

				const valueParsed = value.parse(input[k]);
				if (valueParsed.t === "err") {
					errors.push(
						...valueParsed.error.map((err): ParserError => {
							return {
								message: err.message,
								path: [k, ...err.path],
							};
						}),
					);
					continue;
				}

				result[keyParsed.value] = valueParsed.value;
			}

			if (errors.length > 0) {
				return Err(errors);
			}

			return Ok(result);
		},
	};
};

export const partialDict = <TKey extends string | number, TValue>(
	key: Parser<TKey>,
	value: Parser<TValue>,
): Parser<Partial<{ [key in TKey]: TValue }>> => {
	return {
		parse(input) {
			if (!isIndexable(input)) {
				return Err([
					{
						message: toErrorMessage(
							"object",
							typeof input,
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			const result = {} as Record<TKey, TValue>;
			const errors: ParserError[] = [];
			for (const k in input) {
				const keyParsed = key.parse(k);
				if (keyParsed.t === "err") {
					errors.push(
						...keyParsed.error.map((err): ParserError => {
							return {
								message: err.message,
								path: [k, ...err.path],
							};
						}),
					);
					continue;
				}

				const valueParsed = value.parse(input[k]);
				if (valueParsed.t === "err") {
					errors.push(
						...valueParsed.error.map((err): ParserError => {
							return {
								message: err.message,
								path: [k, ...err.path],
							};
						}),
					);
					continue;
				}

				result[keyParsed.value] = valueParsed.value;
			}

			if (errors.length > 0) {
				return Err(errors);
			}

			return Ok(result);
		},
	};
};

export const custom = <T>(
	predicate: (input: unknown) => input is T,
	errorMessage: string,
): Parser<T> => {
	return {
		parse(input) {
			if (predicate(input)) {
				return Ok(input);
			}
			return Err([
				{
					message: `Custom validation failed. ${errorMessage}`,
					path: [],
				},
			]);
		},
	};
};

export const unknown: Parser<unknown> = {
	parse(input) {
		return Ok(input);
	},
};

export const any: Parser<any> = {
	parse(input) {
		return Ok(input);
	},
};

export const enumeration = <
	T extends string | number | boolean | null | undefined,
>(
	values: T[] | readonly T[],
): Parser<T> => {
	return {
		parse(input) {
			if (!values.includes(input as T)) {
				return Err([
					{
						message: toErrorMessage(
							`one of ${values.join(", ")}`,
							String(input),
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}
			return Ok(input as T);
		},
	};
};

export const brand = <
	T,
	TBrand extends string | number | boolean | null | undefined,
>(
	parser: Parser<T>,
	_brand: TBrand,
): Parser<Brand<T, TBrand>> => {
	return {
		parse(input) {
			const parsed = parser.parse(input);
			switch (parsed.t) {
				case "err":
					return parsed;
				case "ok":
					return Ok(parsed.value as Brand<T, TBrand>);
			}
		},
	};
};

export const regex = (regex: RegExp): Parser<string> => {
	return {
		parse(input) {
			if (typeof input !== "string") {
				return Err([
					{
						message: toErrorMessage(
							"string",
							typeof input,
							JSON.stringify(input),
						),
						path: [],
					},
				]);
			}

			if (!regex.test(input)) {
				return Err([
					{
						message: `Expected string to match regex: ${regex.source}`,
						path: [],
					},
				]);
			}

			return Ok(input);
		},
	};
};
