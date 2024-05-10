import { Err, Ok } from "gamezilla-app/@/core";
import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IVerificationDb } from "./verification-db";

export type Deps = {
	dbConnSql: IDbConnSql;
};

export const VerificationDbPostgres = (deps: Deps): IVerificationDb => {
	
	return {
		async find() {
			return Err("not implemented");
		},
		async put() {
			/**
			 verification_id text NOT NULL,
			code_hash json NOT NULL,
			phone_number text NOT NULL,
			created_at_posix bigint NOT NULL,
			expires_in_milliseconds bigint NOT NULL,
			verified_at_posix bigint
			 */
			const query = `
			INSERT INTO verification (
				verification_id,
				phone_number,
				created_at_posix,
				expires_in_milliseconds,
				code_hash
			) VALUES (
				:verification_id,
				:phone_number,
				:created_at,
				:expires_at,
				:code_hash
			)
			`
			deps.dbConnSql.query()
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
