import { UserId } from "gamezilla/app/@SHARED/data";
import { Account, AccountDb } from "./account-db";
import { Ok } from "gamezilla/@SHARED/core";

export const createAccountDb = (): AccountDb => {
  const accounts = new Map<UserId, Account>();
  return {
    async findOneByEmail(input) {
      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return Ok(account);
        }
      }
      return Ok(null);
    },
    async insertOne(input) {
      accounts.set(input.account.userId, input.account);
      return Ok(null);
    },
  };
};
