import {
  EmailAddress,
  Iso3166Alpha2Code,
  PhoneNumber,
  Result,
  ok,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { Account } from "../../../auth.core";
import { AccountDb } from "./account-db";
import { Parsing as P } from "gamezilla/@SHARED/parsing";

type AccountRow = {
  user_id: string;
  email_address?: string | null;
  phone_number?: string | null;
  phone_number_iso_3166_alpha_2?: string | null;
};

export const toAccountRow = (x: unknown): AccountRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "email_address", P.or(P.str, P.nullish)) &&
    P.has(x, "phone_number", P.or(P.str, P.nullish)) &&
    P.has(x, "phone_number_iso_3166_alpha_2", P.or(P.str, P.nullish))
  ) {
    return {
      user_id: x.user_id,
      email_address: x.email_address,
      phone_number: x.phone_number,
    };
  }
  return null;
};

const rowToAccount = (row: AccountRow): Result<string, Account> => {
  const parsedUserId = UserId.parse(row.user_id);

  if (parsedUserId.t === "err") {
    return parsedUserId;
  }

  const parsedEmailAddress = row.email_address
    ? EmailAddress.parse(row.email_address)
    : null;

  if (parsedEmailAddress && parsedEmailAddress.t === "err") {
    console.error(parsedEmailAddress);
  }

  const parsedPhoneNumberCountryCode = Iso3166Alpha2Code.is(
    row.phone_number_iso_3166_alpha_2
  )
    ? row.phone_number_iso_3166_alpha_2
    : null;

  const parsedPhoneNumber =
    parsedPhoneNumberCountryCode && row.phone_number
      ? PhoneNumber.parse(parsedPhoneNumberCountryCode, row.phone_number)
      : null;

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
  };

  return ok(account);
};

const accountToRow = (account: Account): AccountRow => {
  return {
    user_id: account.userId,
    email_address: account.emailAddress,
    phone_number: account.phoneNumber
      ? PhoneNumber.toString(account.phoneNumber)
      : null,
    phone_number_iso_3166_alpha_2: account.phoneNumber
      ? PhoneNumber.toCountry(account.phoneNumber)
      : null,
  };
};

export const createAccountDb = ({
  dbConn,
}: {
  dbConn: DbConnSql;
}): AccountDb => {
  return {
    async findOneByEmail(input) {
      const queried = await dbConn.query(
        P.is(toAccountRow),
        `SELECT
          user_id,
          email_address,
          phone_number,
          phone_number_iso_3166_alpha_2
        FROM
          user_account
        WHERE
          email_address = :email_address`,
        {
          email_address: input.emailAddress,
        }
      );

      if (queried.t === "err") {
        return queried;
      }

      const row = queried.value[0] ?? null;

      if (!row) {
        return ok(null);
      }

      const account = rowToAccount(row);

      return account;
    },
    async findOneByPhoneNumber(input) {
      const queried = await dbConn.query(
        P.is(toAccountRow),
        `SELECT user_id, email_address, phone_number FROM user_account WHERE phone_number = :phone_number`,
        {
          phone_number: PhoneNumber.toString(input.phoneNumber),
        }
      );

      if (queried.t === "err") {
        return queried;
      }

      const row = queried.value[0] ?? null;

      if (!row) {
        return ok(null);
      }

      const account = rowToAccount(row);

      return account;
    },
    async insertOne(input) {
      const rowNew: AccountRow = {
        user_id: input.account.userId,
        email_address: input.account.emailAddress,
        phone_number: input.account.phoneNumber
          ? PhoneNumber.toString(input.account.phoneNumber)
          : null,
        phone_number_iso_3166_alpha_2: input.account.phoneNumber
          ? PhoneNumber.toCountry(input.account.phoneNumber)
          : null,
      };
      const queried = await dbConn.query(
        P.is(toAccountRow),
        `INSERT INTO user_account (
            user_id,
            email_address,
            phone_number,
            phone_number_iso_3166_alpha_2
          )
          VALUES (
            :user_id,
            :email_address,
            :phone_number,
            :phone_number_iso_3166_alpha_2
          )`,
        rowNew
      );

      if (queried.t === "err") {
        return queried;
      }
      return ok(null);
    },
  };
};
