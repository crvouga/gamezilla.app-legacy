import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IVerificationDb } from "./verification-db";
import { VerificationDbHashMap } from "./verification-db-impl-hash-map";
import { VerificationDbPostgres } from "./verification-db-impl-postgres";

export type Impl =
	| {
			t: "hash-map";
	  }
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
	  };

export const VerificationDb = (impl: Impl): IVerificationDb => {
	switch (impl.t) {
		case "hash-map": {
			return VerificationDbHashMap();
		}
		case "postgres": {
			return VerificationDbPostgres(impl);
		}
	}
};
