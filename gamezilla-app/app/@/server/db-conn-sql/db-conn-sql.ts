import type { Result } from "gamezilla-app/@/core";
import type { p } from "gamezilla-app/@/core/parser";

export type DbConnSqlNotification = {
	processId: number;
	channel: string;
	payload?: string;
};

export type DbConnVariables = {
	[key: string]:
		| number
		| string
		| boolean
		| null
		| undefined
		| Record<string, unknown>;
};

export type IDbConnSql = {
	query: <TRow>(
		parser: p.Parser<TRow>,
		rawSql: string,
		variables: DbConnVariables,
	) => Promise<Result<string, TRow[]>>;
	onNotification: (
		callback: (notification: DbConnSqlNotification) => void,
	) => Promise<() => void>;
};
