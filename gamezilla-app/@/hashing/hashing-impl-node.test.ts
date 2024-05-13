import { describe, expect, it } from "bun:test";
import { Hashing } from "./hashing-impl";

const Fixture = () => {
	const hashing = Hashing({ t: "node" });
	return {
		hashing,
	};
};

describe(import.meta.file, () => {
	it("should hash a password with sha256", async () => {
		const f = Fixture();
		const password = "my-pa$$w0rd";
		const hashed = await f.hashing.hash({
			algo: {
				t: "sha256",
			},
			password,
		});
		expect(hashed.value).not.toBe(password);
	});
});
