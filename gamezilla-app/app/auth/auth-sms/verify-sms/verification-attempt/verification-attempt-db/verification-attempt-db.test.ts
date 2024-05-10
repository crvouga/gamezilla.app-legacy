import { describe, it } from "bun:test";
import { AppServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { VerificationAttemptDb } from "./verification-attempt-db-impl";

const Fixture = async () => {
	const testEnv = await AppServerTestEnv();

	switch (testEnv.t) {
		case "integration": {
			return {
				verificationDb: VerificationAttemptDb({
					t: "postgres",
					dbConnSql: testEnv.dbConnSql,
				}),
			};
		}
		case "unit": {
			return {
				verificationDb: VerificationAttemptDb({
					t: "hash-map",
				}),
			};
		}
	}
};

describe(import.meta.file, () => {
	it.todo("put", async () => {
		const f = await Fixture();
		f;
	});
});
