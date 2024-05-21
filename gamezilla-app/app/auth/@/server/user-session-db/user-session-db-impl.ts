import type { IDbConnKv } from "gamezilla-app/app/@/server/db-conn-kv";
import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IUserSessionDb } from "./user-session-db";
import { UserSessionDbInMemory } from "./user-session-db-impl.in-memory";
import { UserSessionDbPostgres } from "./user-session-db-impl.postgres";
import { UserSessionDbWithDbKvCache } from "./user-session-db-impl.with-db-kv-cache";

export type Impl =
	| {
			t: "in-memory";
			delay: () => Promise<void>;
	  }
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
	  }
	| {
			t: "postgres-with-db-kv-cache";
			dbConnSql: IDbConnSql;
			dbConnKv: IDbConnKv;
	  };

export const UserSessionDb = (impl: Impl): IUserSessionDb => {
	switch (impl.t) {
		case "in-memory": {
			return UserSessionDbInMemory(impl);
		}

		case "postgres": {
			return UserSessionDbPostgres(impl);
		}

		case "postgres-with-db-kv-cache": {
			return UserSessionDbWithDbKvCache({
				SessionDb: UserSessionDbPostgres(impl),
				dbConnKv: impl.dbConnKv,
			});
		}
	}
};
