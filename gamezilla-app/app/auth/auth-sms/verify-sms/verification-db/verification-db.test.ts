import { describe, expect, it } from "bun:test";
import { AppServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { VerificationDb } from "./verification-db-impl";
import { Verification, randomVerification } from "../verification/verification";
import { Ok, Posix, unwrap } from "gamezilla-app/@/core";

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
});
