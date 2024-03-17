import { UserId, UserRole } from "gamezilla-app/@CHILD/app/@SHARED/data"
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
import { Parsing as P } from "gamezilla-app/@SHARED/parsing"

import { IAccountDb } from "./account-db"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"

type AccountRow = {
  user_id: string
  email_address?: string | null
  phone_number?: string | null
  created_at: string
  user_role: UserRole
}

export const toAccountRow = (row: unknown): AccountRow | null => {
  if (
    P.obj(row) &&
    P.has(row, "user_id", P.str) &&
    P.has(row, "email_address", P.or(P.str, P.nullish)) &&
    P.has(row, "phone_number", P.or(P.str, P.nullish)) &&
    P.has(row, "created_at", P.or(P.str, P.date)) &&
    P.has(row, "user_role", UserRole.is)
  ) {
    return {
      user_id: row.user_id,
      email_address: row.email_address,
      phone_number: row.phone_number,
      created_at: new Date(row.created_at).toISOString(),
      user_role: row.user_role,
    }
  }
  return null
}

const rowToAccount = (row: AccountRow): Result<string, Account> => {
  const parsedUserId = UserId.parse(row.user_id)

  if (isErr(parsedUserId)) {
    return parsedUserId
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
        P.is(toAccountRow),
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
        P.is(toAccountRow),
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
        P.is(toAccountRow),
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
        P.is(toAccountRow),
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
