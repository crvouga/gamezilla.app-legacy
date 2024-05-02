import { describe, expect, it } from "bun:test";
import { Posix, Result } from "gamezilla-app/@/core";
import { Hashing } from "gamezilla-app/@/hashing";
import { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import { ServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { AccountDb } from "./account-db-impl";

const Fixture = async () => {
  const hashing = Hashing({ t: "bun" });

  const testEnv = await ServerTestEnv();

  switch (testEnv.t) {
    case "integration": {
      return {
        hashing,
        accountDb: AccountDb({ t: "postgres", dbConnSql: testEnv.dbConnSql }),
      };
    }

    case "unit": {
      return {
        hashing,
        accountDb: AccountDb({ t: "in-memory", async delay() {} }),
      };
    }
  }
};

describe(import.meta.file, () => {
  it("should be able to insert accounts", async () => {
    const f = await Fixture();
    const inserted = await f.accountDb.insert({
      account: {
        userId: UserId.generate(),
        role: "guest",
        createdAt: Posix.now({
          precision: "seconds",
        }),
      },
    });
    expect(inserted.t).toBe("ok");
  });

  it("should be able to find account by user id", async () => {
    const f = await Fixture();
    const account: UserAccount = {
      userId: UserId.generate(),
      role: "guest",
      createdAt: Posix.now({
        precision: "seconds",
      }),
    };
    await f.accountDb.insert({ account });
    const found = await f.accountDb.findOneByUserId({ userId: account.userId });
    const maybeAccount = Result.withDefault(found, null);
    expect(maybeAccount).toEqual(account);
  });

  it("should be able to find account by phone number hash", async () => {
    const f = await Fixture();
    const account: UserAccount = {
      userId: UserId.generate(),
      role: "guest",
      createdAt: Posix.now({
        precision: "seconds",
      }),
    };
    const phoneNumberHash = await f.hashing.hash({
      algo: {
        t: "bcrypt",
        cost: 10,
      },
      password: "+14802098698",
    });
    const inserted = await f.accountDb.insert({ account, phoneNumberHash });
    const found = await f.accountDb.findOneByPhoneNumberHash({
      phoneNumberHash,
    });
    const maybeAccount = Result.withDefault(found, null);
    expect(inserted.t).toBe("ok");
    expect(maybeAccount).toEqual(account);
  });
});
