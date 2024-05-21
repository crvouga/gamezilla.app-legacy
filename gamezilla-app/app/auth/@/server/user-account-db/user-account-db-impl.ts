import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IUserAccountDb } from "./user-account-db";
import { UserAccountDbInMemory } from "./user-account-db-impl-in-memory";
import { UserAccountDbPostgres } from "./user-account-db-impl-postgres";

export type Impl =
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
	  }
	| {
			t: "in-memory";
			delay: () => Promise<void>;
	  };

export const UserAccountDb = (impl: Impl): IUserAccountDb => {
	switch (impl.t) {
		case "in-memory": {
			return UserAccountDbInMemory(impl);
		}

		case "postgres": {
			return UserAccountDbPostgres(impl);
		}
	}
};
