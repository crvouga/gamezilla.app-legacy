import type { ResultPrivate } from "../../result/result";

export type ParserError = {
	message: string;
	path: string[];
};

export type Parser<T> = {
	parse: (input: unknown) => ResultPrivate<ParserError[], T>;
};

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never;
