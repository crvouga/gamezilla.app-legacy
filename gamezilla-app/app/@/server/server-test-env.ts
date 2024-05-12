import { Posix } from "gamezilla-app/@/core";
import { ClientId, SessionId } from "../data";
import { DbConnKv } from "./db-conn-kv";
import { DbConnSql, type IDbConnSql } from "./db-conn-sql";
import { Logger } from "./logger";
import { ServerCtx } from "./server-ctx";
import { SMS } from "./sms";

export type ITestEnv =
	| {
			t: "unit";
	  }
	| {
			t: "integration";
			dbConnSql: IDbConnSql;
	  };

export const AppServerTestEnv = async (): Promise<ITestEnv> => {
	if (process.env["IS_INTEGRATION_TEST"] === "true") {
		const DATABASE_URL = process.env["DATABASE_URL"];

		if (!DATABASE_URL) {
			throw new Error("DATABASE_URL not set");
		}

		const dbConnSql = await DbConnSql({
			t: "postgres",
			databaseUrl: DATABASE_URL,
			logger: Logger({ t: "noop" }),
		});

		return {
			t: "integration",
			dbConnSql,
		};
	}

	return {
		t: "unit",
	};
};

export const randomClient = () => {
	return {
		sessionId: SessionId.generate(),
		clientId: ClientId.generate(),
	};
};

export const AppServerFixture = async () => {
	const logger = Logger({ t: "noop" })
	const ctx: ServerCtx = {
		dbConnKv: await DbConnKv({ t: "hash-map" }),
		dbConnSql: await DbConnSql({ t: "noop" }),
		logger,
		now: Posix.now(),
		sms: SMS({ t: "fake", logger }),
	};
	return {
		ctx,
		//
	};
};
