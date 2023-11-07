import { EmailAddress, ok, has, is, isObj, str } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { DbConnSql } from "gamezilla/app/@SHARED/server";
import { Account } from "../../auth.core";
import { AccountDb } from "./account-db";

type AccountRow = {
  user_id: string;
  email_address: string;
};

export const toAccountRow = (x: unknown): AccountRow | null => {
  if (isObj(x) && has(x, "user_id", str) && has(x, "email_address", str)) {
    return {
      user_id: x.user_id,
      email_address: x.email_address,
    };
  }
  return null;
};

export const createAccountDb = ({
  dbConn,
}: {
  dbConn: DbConnSql;
}): AccountDb => {
  return {
    async findOneByEmail(input) {
      const queried = await dbConn.query(
        is(toAccountRow),
        "SELECT user_id, email_address FROM user_account WHERE email_address = ?",
        [input.emailAddress]
      );

      if (queried.t === "err") {
        return queried;
      }

      const row = queried.value[0] ?? null;

      if (!row) {
        return ok(null);
      }

      const parsedUserId = UserId.parse(row.user_id);

      if (parsedUserId.t === "err") {
        return parsedUserId;
      }

      const parsedEmailAddress = EmailAddress.parse(row.email_address);

      if (parsedEmailAddress.t === "err") {
        return parsedEmailAddress;
      }

      const account: Account = {
        userId: parsedUserId.value,
        emailAddress: parsedEmailAddress.value,
      };
      return ok(account);
    },
    async insertOne(input) {
      const queried = await dbConn.query(
        is(toAccountRow),
        "INSERT INTO user_account (user_id, email_address) VALUES (?, ?)",
        [input.account.userId, input.account.emailAddress]
      );

      if (queried.t === "err") {
        return queried;
      }
      return ok(null);
    },
  };
};
