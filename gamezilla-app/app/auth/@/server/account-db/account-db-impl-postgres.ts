import {
	Err,
	Ok,
	PhoneNumber,
	Posix,
	Result,
	isErr,
} from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId, UserRole } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IAccountDb } from "./account-db";

export const UserAccountRow = p.obj({
	user_id: p.str,
	created_at: p.str,
	user_role: UserRole,
	phone_number: p.maybe(p.str),
});
export type UserAccountRow = p.Infer<typeof UserAccountRow>;

export const UserAccountPhoneNumberRow = p.obj({
	user_id: p.str,
	phone_number_hash: p.dict(p.str, p.unknown),
	created_at: p.str,
});
export type UserAccountPhoneNumberRow = p.Infer<
	typeof UserAccountPhoneNumberRow
>;

const toAccount = ({
	userAccount,
}: {
	userAccount: UserAccountRow;
}): Result<string, UserAccount> => {
	const userId = Result.withDefault(UserId.parse(userAccount.user_id), null);

	if (!userId) {
		return Err("Invalid account. Missing userId.");
	}

	const account: UserAccount = {
		userId,
		role: userAccount.user_role,
		createdAt: postgresTimestampToPosix(userAccount.created_at),
		phoneNumber: Result.withDefault(
			PhoneNumber.fromString(userAccount.phone_number),
			null,
		),
	};

	return Ok(account);
};

const postgresTimestampToPosix = (postgresTimestamp: string) => {
	return Posix.init(new Date(postgresTimestamp).getTime());
};

export const AccountDbPostgres = ({
	dbConnSql,
}: {
	dbConnSql: IDbConnSql;
}): IAccountDb => {
	return {
		async findOneByUserId(input) {
			const queried = await dbConnSql.query(
				UserAccountRow,
				`SELECT
					user_id,
					created_at,
					user_role,
					phone_number
				FROM
					user_account
				WHERE
					user_id = :user_id
				`,
				{
					user_id: input.userId,
				},
			);

			if (isErr(queried)) {
				return queried;
			}

			const row = queried.value[0] ?? null;

			if (!row) {
				return Ok(null);
			}

			const account = toAccount({ userAccount: row });

			return account;
		},

		async findOneByPhoneNumber(input) {
			const queried = await dbConnSql.query(
				UserAccountRow,
				`
				SELECT
					user_id,
					created_at,
					user_role,
					phone_number
				FROM
					user_account
				`,
				{
					phone_number: PhoneNumber.toString(input.phoneNumber),
				},
			);

			if (isErr(queried)) {
				return queried;
			}

			const row = queried.value[0] ?? null;

			if (!row) {
				return Ok(null);
			}

			const account = toAccount({
				userAccount: row,
			});

			return account;
		},
		async insert(input) {
			const accountRowNew: UserAccountRow = {
				created_at: Posix.toIsoString(input.account.createdAt),
				user_id: input.account.userId,
				user_role: input.account.role,
				phone_number: input.phoneNumber
					? PhoneNumber.toString(input.phoneNumber)
					: null,
			};

			const inserted = await dbConnSql.query(
				p.unknown,
				`INSERT INTO user_account (
					phone_number,
					user_role,
					user_id,         
					created_at
				)
				VALUES (
					:phone_number,
					:user_role,
					:user_id,
					:created_at
				)`,
				accountRowNew,
			);

			if (isErr(inserted)) {
				return inserted;
			}

			return Ok(null);
		},
	};
};
