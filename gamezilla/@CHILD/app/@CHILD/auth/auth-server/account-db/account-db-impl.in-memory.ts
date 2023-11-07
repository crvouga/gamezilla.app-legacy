import { ok } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Account } from "../../auth.core";
import { AccountDb } from "./account-db";

export const createAccountDb = (): AccountDb => {
  const accounts = new Map<UserId, Account>();
  return {
    async findOneByEmail(input) {
      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return ok(account);
        }
      }
      return ok(null);
    },
    async insertOne(input) {
      accounts.set(input.account.userId, input.account);
      return ok(null);
    },
  };
};
