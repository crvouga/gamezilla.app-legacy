import { Err } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import { VerificationId } from "../../verification/verification-id";
import type { IVerificationAttemptDb } from "./verification-attempt-db";

export const Row = p.obj({
	verification_id: VerificationId,
	code_hash: p.json,
	phone_number: p.str,
	created_at_posix: p.str,
	expires_at_posix: p.str,
	verified_at_posix: p.maybe(p.str),
});
type Row = p.Infer<typeof Row>;

export const VerificationAttemptDbPostgres = (deps: {
	dbConnSql: IDbConnSql;
}): IVerificationAttemptDb => {
	deps;
	return {
		async put() {
			return Err("not implemented");
		},
		async find() {
			return Err("not implemented");
		},
	};
};
