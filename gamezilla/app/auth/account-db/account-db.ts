import { EmailAddress, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

export type Account = {
  userId: UserId;
  emailAddress: EmailAddress;
};

export type AccountDb = {
  findOneByEmail: (input: {
    emailAddress: EmailAddress;
  }) => Promise<Result<string, Account | null>>;
  insertOne: (input: { account: Account }) => Promise<Result<string, null>>;
};
