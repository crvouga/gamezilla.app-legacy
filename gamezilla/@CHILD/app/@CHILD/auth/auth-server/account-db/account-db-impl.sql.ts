import { EmailAddress, ok } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { Account } from "../../auth.core";
import { AccountDb } from "./account-db";
import { Parsing as P } from "gamezilla/@SHARED/parsing";

type AccountRow = {
  user_id: string;
  email_address: string;
};

export const toAccountRow = (x: unknown): AccountRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "email_address", P.str)
  ) {
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
        P.is(toAccountRow),
        `SELECT user_id, email_address FROM user_account WHERE email_address = :email_address`,
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
        P.is(toAccountRow),
        `INSERT INTO user_account (user_id, email_address) VALUES (:user_id, :email_address)`,
        {
          email_address: input.account.emailAddress,
          user_id: input.account.userId,
        }
      );

      if (queried.t === "err") {
        return queried;
      }
      return ok(null);
    },
  };
};
