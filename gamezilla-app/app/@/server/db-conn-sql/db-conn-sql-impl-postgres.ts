import { Err, Ok } from "gamezilla-app/@/core";
import type { p } from "gamezilla-app/@/core/parser";
import pg from "pg";
import type { ILogger } from "../logger/logger";
import type { IDbConnSql } from "./db-conn-sql";
import { logQuery } from "./shared";
import { toSql, toSqlLog } from "./sql";

declare global {
	var pgPool: pg.Pool;
	var pgPoolClient: pg.PoolClient;
}

export const DbConnPostgres = async ({
	databaseUrl,
	logger,
}: {
	databaseUrl: string;
	logger: ILogger;
}): Promise<IDbConnSql> => {
	globalThis.pgPool ??= new pg.Pool({
		connectionString: databaseUrl,
	});

	globalThis.pgPoolClient ??= await globalThis.pgPool.connect();

	return {
		async query(rowParser, rawSql, params) {
			const sql = toSql(rawSql, params);
			try {
				const start = Date.now();

				const queried = await pgPool.query(sql);

				const end = Date.now();

				logQuery({
					logger,
					sql: toSqlLog(rawSql, params),
					start,
					end,
				});

				const output: p.Infer<typeof rowParser>[] = [];

				for (let i = 0; i < queried.rows.length; i++) {
					const row = queried.rows[i]!;
					for (const columnKey in row) {
						const value = row[columnKey];

						if (value instanceof Date) {
							row[columnKey] = value.toUTCString();
						}
					}

					const parsed = rowParser.parse(row);

					if (parsed.t === "err") {
						logger.error(
							`Failed to parse row=${JSON.stringify(
								row,
								null,
								4,
							)} \nerror=${JSON.stringify(
								parsed.error,
								null,
								4,
							)} sql=${rawSql}`,
						);
						continue;
					}

					output.push(parsed.value);
				}

				return Ok(output);
			} catch (error) {
				logger.error(`${error} sql=${rawSql}`);
				return Err(String(error));
			}
		},

		async onNotification(callback) {
			const cb = (notification: pg.Notification) => {
				callback({
					processId: notification.processId,
					channel: notification.channel,
					payload: notification.payload,
				});
			};

			pgPoolClient.on("notification", cb);

			return () => {
				pgPoolClient.off("notification", cb);
			};
		},
	};
};
