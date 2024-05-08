import { describe, expect, it } from "bun:test";
import { IS_INTEGRATION_TEST } from "public-config";
import { Hashing } from "./hashing-impl";

const Fixture = () => {
	const hashing = Hashing({ t: "bun" });
	return {
		hashing,
	};
};

describe.if(IS_INTEGRATION_TEST)( import.meta.file, () => {
	it("should be able to hash a password with bcrypt", async () => {
		const f = Fixture();
		const password = "my-pa$$w0rd";

		const hashed = await f.hashing.hash({
			algo: {
				t: "bcrypt",
				cost: 10,
			},
			password,
		});
		expect(hashed.value).not.toBe(password);
	});

	it("should be able to check password against hash using bcrypt", async () => {
		const f = Fixture();
		const password = "my-pa$$w0rd";
		const hashed = await f.hashing.hash({
			algo: {
				t: "bcrypt",
				cost: 10,
			},
			password,
		});
		const checked = await f.hashing.check({
			hash: hashed,
			password,
		});
		expect(checked).toBe(true);
	});
});
