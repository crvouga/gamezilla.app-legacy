import { type Task } from "gamezilla-app/@/core";
import type { Parser } from "gamezilla-app/@/core/parser/parser";

export type IDbConnKv = {
	get: <TValue>(
		key: string,
		parser: Parser<TValue>,
	) => Task<string, TValue | null>;
	getMany: <TValue>(
		keys: string[],
		parser: Parser<TValue>,
	) => Task<string, TValue[]>;
	set: <TValue>(key: string, value: TValue) => Task<string, null>;
	setMany: <TValue>(entries: [string, TValue][]) => Task<string, null>;
	zap: (key: string) => Task<string, null>;
};
