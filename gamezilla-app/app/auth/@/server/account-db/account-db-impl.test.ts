import { describe, expect, it } from "bun:test";
import { Ok, PhoneNumber, Posix, Result } from "gamezilla-app/@/core";
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
		const phoneNumber = PhoneNumber.random()
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
});
