import { UserId, UserRole } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server"
import {
  EmailAddress,
  PhoneNumber,
  Posix,
  Result,
  err,
  isErr,
  ok,
} from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parser"
import { IAccountDb } from "./account-db"

type AccountRow = {
  user_id: string
  email_address?: string | null
  phone_number?: string | null
  created_at: string
  user_role: UserRole
}

const AccountRow = p.obj({
  user_id: p.str,
  email_address: p.maybe(p.str),
  phone_number: p.maybe(p.str),
  created_at: p.str,
  user_role: p.custom(UserRole.is, "Invalid user role"),
})

const rowToAccount = (row: AccountRow): Result<string, Account> => {
  const parsedUserId = UserId.parse(row.user_id)

  if (isErr(parsedUserId)) {
    return Result.mapErr(parsedUserId, p.errorsToString)
  }

  const userId = parsedUserId.value

  const createdAt = postgresTimestampToPosix(row.created_at)

  const parsedEmailAddress = row.email_address
    ? EmailAddress.parse(row.email_address)
    : null

  const parsedPhoneNumber = row.phone_number
    ? PhoneNumber.parse(row.phone_number)
    : null

  const emailAddress =
    parsedEmailAddress && parsedEmailAddress.t === "ok"
      ? parsedEmailAddress.value
      : null

  const phoneNumber =
    parsedPhoneNumber && parsedPhoneNumber.t === "ok"
      ? parsedPhoneNumber.value
      : null

  switch (row.user_role) {
    case "guest": {
      return ok({
        role: "guest",
        createdAt,
        userId,
      })
    }

    case "normal": {
      if (!emailAddress || !phoneNumber) {
        return err("invalid_account")
      }

      return ok({
        role: "normal",
        createdAt,
        userId,
        emailAddress,
        phoneNumber,
      })
    }

    case "super": {
      if (!emailAddress || !phoneNumber) {
        return err("invalid_account")
      }
      return ok({
        role: "super",
        createdAt,
        userId,
        emailAddress,
        phoneNumber,
      })
    }
  }
}

const postgresTimestampToPosix = (postgresTimestamp: string) => {
  return Posix.fromNumber(new Date(postgresTimestamp).getTime())
}

const accountToRow = (account: Account): AccountRow => {
  return {
    user_id: account.userId,
    email_address: account.emailAddress,
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
        return ok(null)
      }

      const account = rowToAccount(row)

      return account
    },

    async findOneByEmail(input) {
      const queried = await dbConnSql.query(
        AccountRow,
        `SELECT
          user_id,
          email_address,
          phone_number
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
        return ok(null)
      }

      const account = rowToAccount(row)

      return account
    },
    async findOneByPhoneNumber(input) {
      const queried = await dbConnSql.query(
        AccountRow,
        `SELECT user_id, email_address, phone_number FROM user_account WHERE phone_number = :phone_number`,
        {
          phone_number: PhoneNumber.toString(input.phoneNumber),
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const row = queried.value[0] ?? null

      if (!row) {
        return ok(null)
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
      return ok(null)
    },
  }
}
