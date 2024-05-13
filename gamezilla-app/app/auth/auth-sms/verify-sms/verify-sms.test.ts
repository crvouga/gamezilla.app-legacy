import { describe, expect, it } from "bun:test";
import { PhoneNumber } from "gamezilla-app/@/core";
import { VerifySMSInHouseFixture } from "./verify-sms-impl/verify-sms-impl-in-house/verify-sms-impl-in-house.test-fixture";

const Fixture = async () => {
	const inHouseFixture = await VerifySMSInHouseFixture();

	return {
		...inHouseFixture,
	};
};

describe(import.meta.file, () => {
	it("should be ok sending code", async () => {
		const f = await Fixture();
		const result = await f.verifySMS.sendCode({
			phoneNumber: PhoneNumber.random(),
			preferredLanguage: "en",
		});
		expect(result.t).toBe("ok");
	});
});
