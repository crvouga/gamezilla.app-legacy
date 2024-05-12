import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IVerificationDb } from "./verification-db";
import { VerificationDbHashMap } from "./verification-db-impl-hash-map";
import { VerificationDbPostgres } from "./verification-db-impl-postgres";
import { Err } from "gamezilla-app/@/core";

export type Impl =
	| {
			t: "hash-map";
	  }
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
	  }
	| {
			t: "always-err";
			error: string;
	  };

export const VerificationDb = (impl: Impl): IVerificationDb => {
	switch (impl.t) {
		case "hash-map": {
			return VerificationDbHashMap();
		}
		case "postgres": {
			return VerificationDbPostgres(impl);
		}
		case "always-err": {
			return {
				async find() {
					return Err(impl.error);
				},
				async put() {
					return Err(impl.error);
				},
			};
		}
	}
};
