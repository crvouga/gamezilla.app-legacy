import { describe, expect, it } from "bun:test";
import { Ok, Posix, TimeSpan, unwrap } from "gamezilla-app/@/core";
import { AppServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { Verification, randomVerification } from "../verification";
import { VerificationDb } from "./verification-db-impl";

const Fixture = async () => {
	//
	const testEnv = await AppServerTestEnv();
	switch (testEnv.t) {
		case "integration": {
			return {
				verificationDb: VerificationDb({
					t: "postgres",
					dbConnSql: testEnv.dbConnSql,
				}),
			};
		}
		case "unit": {
			return {
				verificationDb: VerificationDb({
					t: "hash-map",
				}),
			};
		}
	}
};

type Fixture = Awaited<ReturnType<typeof Fixture>>;

describe(import.meta.file, () => {
	it("should be ok inserting records", async () => {
		const f = await Fixture();
		const verification = await randomVerification();
		const inserted = await f.verificationDb.put(verification);
		expect(inserted).toEqual(Ok(null));
	});

	it("should insert records correctly", async () => {
		const f = await Fixture();
		const verification = await randomVerification();
		const before = await f.verificationDb.find({
			where: {
				verificationId: {
					"=": verification.verificationId,
				},
			},
		});
		await f.verificationDb.put(verification);
		const after = await f.verificationDb.find({
			where: {
				verificationId: {
					"=": verification.verificationId,
				},
			},
		});
		expect(unwrap(before).items[0] ?? null).toEqual(null);
		expect(unwrap(after).items[0]).toEqual(verification);
	});

	it("should upsert records correctly", async () => {
		const f = await Fixture();
		const verification = await randomVerification();
		await f.verificationDb.put(verification);
		const before = await f.verificationDb.find({
			where: {
				verificationId: {
					"=": verification.verificationId,
				},
			},
		});
		const verificationNew: Verification = {
			...verification,
			verifiedAt: Posix.now(),
		};
		await f.verificationDb.put(verificationNew);
		const after = await f.verificationDb.find({
			where: {
				verificationId: {
					"=": verification.verificationId,
				},
			},
		});
		expect(unwrap(before).items[0]).toEqual(verification);
		expect(unwrap(after).items[0]).toEqual(verificationNew);
	});

	it("should find by phone number", async () => {
		const f = await Fixture();
		const verification = await randomVerification();
		await f.verificationDb.put(verification);
		const found = await f.verificationDb.find({
			where: {
				phoneNumber: {
					"=": verification.phoneNumber,
				},
			},
		});
		expect(unwrap(found).items[0]).toEqual(verification);
	});

	it.todo("should find by created at correctly", async () => {
		const f = await Fixture();
		const now = Posix.now();

		await insertVerifications({
			f,
			start: Posix.past(now, TimeSpan.minutes(11)),
			end: Posix.past(now, TimeSpan.minutes(10)),
		});

		await insertVerifications({
			f,
			start: Posix.future(now, TimeSpan.minutes(10)),
			end: Posix.future(now, TimeSpan.minutes(11)),
		});

		const start = now;
		const end = Posix.future(now, TimeSpan.minutes(1));
		const expected = await insertVerifications({
			f,
			start,
			end,
		});

		const found = await f.verificationDb.find({
			where: {
				createdAt: {
					"<=": end,
					">=": start,
				},
			},
		});
		const actual = unwrap(found).items;
		expect(actual).toEqual(expected);
	});

	it("should insert attempts correctly", async () => {});
});

const insertVerifications = async ({
	f,
	start,
	end,
	count = 3,
}: {
	f: Fixture;
	end: Posix;
	count?: number;
	start: Posix;
}) => {
	const verifications: Verification[] = [];

	const timeSpan = TimeSpan.scale(Posix.diff(end, start), 1 / count);

	let runningCreatedAt = start;

	for (let i = 0; i < count; i++) {
		const verification = await randomVerification({
			createdAt: runningCreatedAt,
		});
		await f.verificationDb.put(verification);
		verifications.push(verification);
		runningCreatedAt = Posix.future(runningCreatedAt, timeSpan);
	}

	return verifications;
};
