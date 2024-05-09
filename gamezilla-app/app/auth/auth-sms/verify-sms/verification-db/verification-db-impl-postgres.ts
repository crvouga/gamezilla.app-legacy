import { Err, Ok } from "gamezilla-app/@/core";
import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IVerificationDb } from "./verification-db";

export type Deps = {
	dbConnSql: IDbConnSql;
};

export const VerificationDbPostgres = (deps: Deps): IVerificationDb => {
	deps;
	return {
		async find() {
			return Err("not implemented");
		},
		async put() {
			return Ok(null);
		},
		attempts: {
			async put() {
				return Err("not implemented");
			},
			async find() {
				return Err("not implemented");
			},
		},
	};
};
