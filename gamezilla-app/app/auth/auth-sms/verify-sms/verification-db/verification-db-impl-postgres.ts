import {
	Err,
	Ok,
	PhoneNumber,
	Posix,
	Result,
	isErr,
} from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { Hash } from "gamezilla-app/@/hashing";
import { Sql } from "gamezilla-app/@/sql";
import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import { Verification } from "../verification/verification";
import { VerificationId } from "../verification/verification-id";
import type { IVerificationDb, WhereClause } from "./verification-db";

export const Row = p.obj({
	verification_id: VerificationId,
	code_hash: p.json,
	phone_number: p.str,
	created_at_posix: p.str,
	expires_at_posix: p.str,
	verified_at_posix: p.maybe(p.str),
});
type Row = p.Infer<typeof Row>;

export const VerificationDbPostgres = (deps: {
	dbConnSql: IDbConnSql;
}): IVerificationDb => {
	return {
		async find(input) {
			const where = toSqlWhere(input.where);
			const pagination = Sql.pagination(input);
			const query = `
				SELECT * FROM auth_sms_verification
				${where.str}
				ORDER BY created_at_posix DESC
				${pagination.str}
			`;
			const vars = {
				...where.vars,
				...pagination.vars,
			};
			const queried = await deps.dbConnSql.query(Row, query, vars);

			if (isErr(queried)) {
				return queried;
			}

			const queryCount = `
				SELECT COUNT(*) FROM auth_sms_verification
				${where.str}
			`;
			const queriedCount = await deps.dbConnSql.query(
				p.obj({ count: p.str }),
				queryCount,
				where.vars,
			);

			if (isErr(queriedCount)) {
				return queriedCount;
			}

			const total = parseInt(queriedCount.value[0]?.count ?? "0") ?? 0;

			const items = queried.value.flatMap((row) => {
				const verification = rowToVerification(row);
				return verification ? [verification] : [];
			});

			return Ok({
				items,
				limit: input.limit ?? Infinity,
				offset: input.offset ?? 0,
				total,
			});
		},
		async put(verification) {
			const query = `
				INSERT INTO auth_sms_verification (
					verification_id,
					phone_number,
					created_at_posix,
					expires_at_posix,
					code_hash
				) VALUES (
					:verification_id,
					:phone_number,
					:created_at_posix,
					:expires_at_posix,
					:code_hash
				) ON CONFLICT (verification_id) DO UPDATE SET
					phone_number = :phone_number,
					created_at_posix = :created_at_posix,
					expires_at_posix = :expires_at_posix,
					code_hash = :code_hash,
					verified_at_posix = :verified_at_posix
			`;

			const vars = {
				verification_id: verification.verificationId,
				phone_number: PhoneNumber.toString(verification.phoneNumber),
				created_at_posix: verification.createdAt,
				expires_at_posix: verification.expiresAt,
				code_hash: Sql.json(verification.codeHash),
				verified_at_posix: verification.verifiedAt,
			};
			const queried = await deps.dbConnSql.query(p.unknown, query, vars);

			return Result.mapOk(queried, () => null);
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

const rowToVerification = (row: Row): Verification | null => {
	const phoneNumber = Result.withDefault(
		PhoneNumber.fromString(row.phone_number),
		null,
	);
	if (!phoneNumber) {
		return null;
	}
	const codeHash = Result.withDefault(Hash.parse(row.code_hash), null);
	if (!codeHash) {
		return null;
	}
	return {
		verificationId: row.verification_id,
		codeHash,
		phoneNumber,
		createdAt: Posix.init(row.created_at_posix),
		expiresAt: Posix.init(row.expires_at_posix),
		verifiedAt: row.verified_at_posix
			? Posix.init(row.verified_at_posix)
			: null,
	};
};

const toSqlWhere = (where?: WhereClause) => {
	const vars: Record<string, any> = {};
	const clauses: string[] = [];

	if (where?.verificationId?.["="]) {
		clauses.push(`verification_id = :verification_id`);
		vars["verification_id"] = where?.verificationId["="];
	}

	if (where?.phoneNumber?.["="]) {
		clauses.push(`phone_number = :phone_number`);
		vars["phone_number"] = PhoneNumber.toString(where?.phoneNumber["="]);
	}

	if (where?.createdAt?.["<="]) {
		clauses.push(`created_at_posix <= :created_at_posix`);
		vars["created_at_posix"] = where?.createdAt["<="];
	}

	if (where?.createdAt?.[">="]) {
		clauses.push(`created_at_posix >= :created_at_posix`);
		vars["created_at_posix"] = where?.createdAt[">="];
	}

	const str = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

	return {
		str,
		vars,
	};
};
