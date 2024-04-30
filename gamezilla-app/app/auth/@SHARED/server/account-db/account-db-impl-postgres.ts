import { Err, Ok, Posix, Result, isErr } from "gamezilla-app/@shared/core"
import { p } from "gamezilla-app/@shared/core/parser"
import { UserId, UserRole } from "gamezilla-app/app/@shared/data"
import { UserAccount } from "gamezilla-app/app/@shared/data/account"
import { IDbConnSql } from "gamezilla-app/app/@shared/server/db-conn-sql"
import { IAccountDb } from "./account-db"

export const UserAccountRow = p.obj({
  user_id: p.str,
  created_at: p.str,
  user_role: UserRole,
})
export type UserAccountRow = p.Infer<typeof UserAccountRow>

export const UserAccountPhoneNumberRow = p.obj({
  user_id: p.str,
  phone_number_hash: p.dict(p.str, p.unknown),
  created_at: p.str,
})
export type UserAccountPhoneNumberRow = p.Infer<
  typeof UserAccountPhoneNumberRow
>

const toAccount = ({
  userAccount,
}: {
  userAccount: UserAccountRow
}): Result<string, UserAccount> => {
  const userId = Result.withDefault(UserId.parse(userAccount.user_id), null)

  if (!userId) {
    return Err("Invalid account. Missing userId.")
  }

  const account: UserAccount = {
    userId,
    role: userAccount.user_role,
    createdAt: postgresTimestampToPosix(userAccount.created_at),
  }

  return Ok(account)
}

const postgresTimestampToPosix = (postgresTimestamp: string) => {
  return Posix.fromNumber(new Date(postgresTimestamp).getTime())
}

export const AccountDbPostgres = ({
  dbConnSql,
}: {
  dbConnSql: IDbConnSql
}): IAccountDb => {
  return {
    async findOneByUserId(input) {
      const queried = await dbConnSql.query(
        UserAccountRow,
        `SELECT
          user_id,
          created_at,
          user_role
        FROM
          user_account
        WHERE
          user_id = :user_id`,
        {
          user_id: input.userId,
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount({ userAccount: row })

      return account
    },

    async findOneByPhoneNumberHash(input) {
      const queried = await dbConnSql.query(
        UserAccountRow,
        `
        SELECT
          user_account.user_id    AS user_id,
          user_account.created_at AS created_at,
          user_account.user_role  AS user_role
        FROM
          user_account_phone_number
        JOIN user_account
        ON user_account_phone_number.user_id = user_account.user_id
        WHERE
          phone_number_hash->>'value' = :phone_number_hash_value`,
        {
          phone_number_hash_value: input.phoneNumberHash.value,
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = toAccount({
        userAccount: row,
      })

      return account
    },
    async insert(input) {
      const accountRowNew: UserAccountRow = {
        created_at: Posix.toIsoString(input.account.createdAt),
        user_id: input.account.userId,
        user_role: input.account.role,
      }

      const accountPhoneNumberRowNew: UserAccountPhoneNumberRow | null =
        input.phoneNumberHash
          ? {
              user_id: input.account.userId,
              phone_number_hash: input.phoneNumberHash,
              created_at: Posix.toIsoString(input.account.createdAt),
            }
          : null

      const insertedAccount = await dbConnSql.query(
        p.unknown,
        `INSERT INTO user_account (
            user_role,
            user_id,         
            created_at
          )
          VALUES (
            :user_role,
            :user_id,
            :created_at
          )`,
        accountRowNew,
      )

      const insertedAccountPhoneNumber = accountPhoneNumberRowNew
        ? await dbConnSql.query(
            p.unknown,
            `INSERT INTO user_account_phone_number (
              user_id,
              phone_number_hash,
              created_at
            )
            VALUES (
              :user_id,
              :phone_number_hash,
              :created_at
            )`,
            accountPhoneNumberRowNew,
          )
        : Ok(null)

      const combined = Result.combine([
        insertedAccount,
        insertedAccountPhoneNumber,
      ])

      if (isErr(combined)) {
        return combined
      }

      return Ok(null)
    },
  }
}
