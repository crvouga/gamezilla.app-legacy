import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import {
  EmailAddress,
  PhoneNumber,
  Result,
  isErr,
  ok,
} from "gamezilla/@SHARED/core"
import { Parsing as P } from "gamezilla/@SHARED/parsing"
import { Account } from "../../../auth.core"
import { IAccountDb } from "./account-db"

type AccountRow = {
  user_id: string
  email_address?: string | null
  phone_number?: string | null
}

export const toAccountRow = (x: unknown): AccountRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "email_address", P.or(P.str, P.nullish)) &&
    P.has(x, "phone_number", P.or(P.str, P.nullish))
  ) {
    return {
      user_id: x.user_id,
      email_address: x.email_address,
      phone_number: x.phone_number,
    }
  }
  return null
}

const rowToAccount = (row: AccountRow): Result<string, Account> => {
  const parsedUserId = UserId.parse(row.user_id)

  if (isErr(parsedUserId)) {
    return parsedUserId
  }

  const parsedEmailAddress = row.email_address
    ? EmailAddress.parse(row.email_address)
    : null

  if (parsedEmailAddress && isErr(parsedEmailAddress)) {
    console.error(parsedEmailAddress)
  }

  const parsedPhoneNumber = row.phone_number
    ? PhoneNumber.parse(row.phone_number)
    : null

  const account: Account = {
    userId: parsedUserId.value,
    emailAddress:
      parsedEmailAddress && parsedEmailAddress.t === "ok"
        ? parsedEmailAddress.value
        : null,
    phoneNumber:
      parsedPhoneNumber && parsedPhoneNumber.t === "ok"
        ? parsedPhoneNumber.value
        : null,
  }

  return ok(account)
}

const accountToRow = (account: Account): AccountRow => {
  return {
    user_id: account.userId,
    email_address: account.emailAddress,
    phone_number: account.phoneNumber
      ? PhoneNumber.toString(account.phoneNumber)
      : null,
  }
}

export const AccountDbPostgres = ({
  dbConn,
}: {
  dbConn: DbConnSql
}): IAccountDb => {
  return {
    async findOneByEmail(input) {
      const queried = await dbConn.query(
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
      const queried = await dbConn.query(
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

      const queried = await dbConn.query(
        P.is(toAccountRow),
        `INSERT INTO user_account (
            user_id,
            email_address,
            phone_number
          )
          VALUES (
            :user_id,
            :email_address,
            :phone_number
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
