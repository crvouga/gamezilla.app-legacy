import { describe, expect, it } from "bun:test";
import { Ok, PhoneNumber, Posix, Result } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import { AppServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { AccountDb } from "./account-db-impl";

const Fixture = async () => {
	const testEnv = await AppServerTestEnv();

	switch (testEnv.t) {
		case "integration": {
			return {
				accountDb: AccountDb({ t: "postgres", dbConnSql: testEnv.dbConnSql }),
			};
		}

		case "unit": {
			return {
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
				phoneNumber: null,
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
			phoneNumber: null,
		};
		await f.accountDb.insert({ account });
		const found = await f.accountDb.findOneByUserId({ userId: account.userId });
		const maybeAccount = Result.withDefault(found, null);
		expect(maybeAccount).toEqual(account);
	});

	it("should be able to find account by phone number", async () => {
		const f = await Fixture();
		const phoneNumber = PhoneNumber.random();
		const account: UserAccount = {
			phoneNumber,
			userId: UserId.generate(),
			role: "normal",
			createdAt: Posix.now({
				precision: "seconds",
			}),
		};
		const insert = await f.accountDb.insert({ account });
		expect(insert.t).toBe("ok");
		const found = await f.accountDb.findOneByPhoneNumber({ phoneNumber });
		expect(found).toEqual(Ok(account));
	});

	it("should error if after inserting an existing account", async () => {
		const f = await Fixture();
		const account: UserAccount = {
			userId: UserId.generate(),
			role: "guest",
			createdAt: Posix.now({
				precision: "seconds",
			}),
			phoneNumber: null,
		};
		await f.accountDb.insert({ account });
		const insert = await f.accountDb.insert({ account });
		expect(insert.t).toBe("err");
	});

	it("should find null if finding account by user id and null is passed as user id", async () => {
		const f = await Fixture();
		const found = await f.accountDb.findOneByUserId({ userId: null });
		expect(found).toEqual(Ok(null));
	});

	it("should find null if user id doesnt exist", async () => {
		const f = await Fixture();
		const found = await f.accountDb.findOneByUserId({
			userId: UserId.generate(),
		});
		expect(found).toEqual(Ok(null));
	});
});
