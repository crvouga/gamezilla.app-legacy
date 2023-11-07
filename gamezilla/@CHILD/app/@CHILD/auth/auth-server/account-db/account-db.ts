import { EmailAddress, Result } from "gamezilla/@SHARED/core";
import { Account } from "../../auth.core";

export type AccountDb = {
  findOneByEmail: (input: {
    emailAddress: EmailAddress;
  }) => Promise<Result<string, Account | null>>;
  insertOne: (input: { account: Account }) => Promise<Result<string, null>>;
};
