import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IVerificationAttemptDb } from "./verification-attempt-db";
import { VerificationAttemptDbHashMap } from "./verification-attempt-db-impl-hash-map";
import { VerificationAttemptDbPostgres } from "./verification-attempt-db-impl-postgres";

export type Impl =
	| {
			t: "hash-map";
	  }
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
	  };

export const VerificationAttemptDb = (impl: Impl): IVerificationAttemptDb => {
	switch (impl.t) {
		case "hash-map": {
			return VerificationAttemptDbHashMap();
		}

		case "postgres": {
			return VerificationAttemptDbPostgres(impl);
		}
	}
};
