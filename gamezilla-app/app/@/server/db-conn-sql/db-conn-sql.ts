import type { Result } from "gamezilla-app/@/core";
import type { p } from "gamezilla-app/@/core/parser";
import { Sql } from "gamezilla-app/@/sql";

export type DbConnSqlNotification = {
	processId: number;
	channel: string;
	payload?: string;
};

export type IDbConnSql = {
	query: <TRow>(
		parser: p.Parser<TRow>,
		rawSql: string,
		variables: Sql.Vars,
	) => Promise<Result<string, TRow[]>>;
	onNotification: (
		callback: (notification: DbConnSqlNotification) => void,
	) => Promise<() => void>;
};
