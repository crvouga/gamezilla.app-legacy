import { UserId, UserRole } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import {
  EmailAddress,
  Err,
  Ok,
  PhoneNumber,
  Posix,
  Result,
  isErr,
} from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { IAccountDb } from "./account-db"

export const AccountRow = p.obj({
  user_id: p.str,
  email_address: p.maybe(p.str),
  phone_number: p.maybe(p.str),
  created_at: p.str,
  user_role: UserRole,
})

export type AccountRow = p.Infer<typeof AccountRow>

const rowToAccount = (row: AccountRow): Result<string, Account> => {
  const userId = Result.withDefault(UserId.parse(row.user_id), null)

  if (!userId) {
    return Err("Invalid account. Missing userId.")
  }

  const account: Account = {
    userId,
    role: row.user_role,
    createdAt: postgresTimestampToPosix(row.created_at),
    emailAddress: Result.withDefault(
      EmailAddress.parse(row.email_address),
      null,
    ),
    phoneNumber: Result.withDefault(
      PhoneNumber.fromString(row.phone_number),
      null,
    ),
  }

  return Ok(account)
}

const postgresTimestampToPosix = (postgresTimestamp: string) => {
  return Posix.fromNumber(new Date(postgresTimestamp).getTime())
}

const accountToRow = (account: Account): AccountRow => {
  return {
    user_id: account.userId,
    email_address: account.emailAddress
      ? EmailAddress.toString(account.emailAddress)
      : null,
    phone_number: account.phoneNumber
      ? PhoneNumber.toString(account.phoneNumber)
      : null,
    created_at: Posix.toIsoString(account.createdAt),
    user_role: account.role,
  }
}

export const AccountDbPostgres = ({
  dbConnSql,
}: {
  dbConnSql: DbConnSql
}): IAccountDb => {
  return {
    async findOneByUserId(input) {
      const queried = await dbConnSql.query(
        AccountRow,
        `SELECT
          user_id,
          email_address,
          phone_number,
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

      const account = rowToAccount(row)

      return account
    },

    async findOneByEmailAddress(input) {
      const queried = await dbConnSql.query(
        AccountRow,
        `SELECT
          user_id,
          email_address,
          phone_number,
          created_at,
          user_role
        FROM
          user_account
        WHERE
          email_address = :email_address`,
        {
          email_address: input.emailAddress,
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = rowToAccount(row)

      return account
    },
    async findOneByPhoneNumber(input) {
      const queried = await dbConnSql.query(
        AccountRow,
        `SELECT 
          user_id,
          email_address,
          phone_number,
          created_at,
          user_role
        FROM
          user_account
        WHERE
          phone_number = :phone_number`,
        {
          phone_number: PhoneNumber.toString(input.phoneNumber),
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return Ok(null)
      }

      const account = rowToAccount(row)

      return account
    },
    async insert(account) {
      const rowNew = accountToRow(account)

      const queried = await dbConnSql.query(
        AccountRow,
        `INSERT INTO user_account (
            user_role,
            user_id,
            email_address,
            phone_number,
            created_at
          )
          VALUES (
            :user_role,
            :user_id,
            :email_address,
            :phone_number,
            :created_at
          )`,
        rowNew,
      )

      if (isErr(queried)) {
        return queried
      }
      return Ok(null)
    },
  }
}
