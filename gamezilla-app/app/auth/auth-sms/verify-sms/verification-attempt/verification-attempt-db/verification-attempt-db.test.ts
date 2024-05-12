import { describe, expect, it } from "bun:test";
import { AppServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { VerificationAttemptDb } from "./verification-attempt-db-impl";
import { randomVerificationAttempt } from "../verification-attempt";

const Fixture = async () => {
	const testEnv = await AppServerTestEnv();

	switch (testEnv.t) {
		case "integration": {
			return {
				verificationAttemptDb: VerificationAttemptDb({
					t: "postgres",
					dbConnSql: testEnv.dbConnSql,
				}),
			};
		}
		case "unit": {
			return {
				verificationAttemptDb: VerificationAttemptDb({
					t: "hash-map",
				}),
			};
		}
	}
};

describe(import.meta.file, () => {
	it.todo("should be ok after inserting", async () => {
		const f = await Fixture();
		const verificationAttempt = await randomVerificationAttempt();
		const result = await f.verificationAttemptDb.put(verificationAttempt);
		expect(result.t).toBe("ok");
	});
});
