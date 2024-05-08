import { describe, expect, it } from "bun:test";
import {
	PhoneNumber,
	Posix,
	Result,
	TimeSpan,
	eq,
	isErr,
	isOk,
} from "gamezilla-app/@/core";
import { Hashing } from "gamezilla-app/@/hashing";
import { Translator } from "gamezilla-app/app/@/client/translator";
import { Logger } from "gamezilla-app/app/@/server/logger";
import { SMSFake } from "gamezilla-app/app/@/server/sms/sms-impl-fake";
import { CodeGenerator } from "./code-generator";
import { VerificationId } from "./verification";
import { VerificationDb } from "./verification-db";
import { VerifySMS } from "./verify-sms-impl";

const Fixture = async (input?: {
	verifyCodeMaxAttempts?: number;
	verifyCodeExpiresIn?: TimeSpan;
	sendCodeHourlyLimit?: number;
	now?: () => Posix;
}) => {
	const sms = SMSFake();
	const CODE = "123456";
	const WRONG_CODE = "42";
	const codeGenerator = CodeGenerator({ t: "fake", code: CODE });
	const logger = Logger({ t: "noop" });
	const translator = Translator("en");
	const verificationDb = VerificationDb({ t: "hash-map" });
	const hashing = Hashing({ t: "noop" });

	const verifySMS = VerifySMS({
		t: "real",
		logger,
		sms,
		codeGenerator,
		translator,
		verificationDb,
		hashing,
		now: input?.now ?? Posix.now,
		sendCodeHourlyLimit: input?.sendCodeHourlyLimit ?? 10,
		verifyCodeExpiresIn: input?.verifyCodeExpiresIn ?? TimeSpan.fromMinutes(5),
		verifyCodeMaxAttempts: input?.verifyCodeMaxAttempts ?? 3,
	});

	const phoneNumber = Result.unwrap(PhoneNumber.fromString("+1 480-209-8698"));

	return {
		translator,
		CODE,
		WRONG_CODE,
		phoneNumber,
		verifySMS,
		sms,
	};
};

describe(import.meta.file, () => {
	it("should be ok", async () => {
		const f = await Fixture();

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.unwrap(sent).verificationId;

		const verified = await f.verifySMS.verifyCode({
			verificationId,
			code: f.CODE,
		});

		expect(isOk(sent)).toBe(true);
		expect(isOk(verified)).toBe(true);
	});

	it("should send a sms message with the code in it", async () => {
		const f = await Fixture();
		await f.verifySMS.sendCode({
			phoneNumber: f.phoneNumber,
		});
		expect(f.sms.sent[0]?.message.includes(f.CODE)).toBe(true);
	});

	it("should send a sms message to the phone number inputted", async () => {
		const f = await Fixture();
		await f.verifySMS.sendCode({
			phoneNumber: f.phoneNumber,
		});
		expect(
			f.sms.sent.every((smsMessage) =>
				eq(smsMessage.phoneNumber, f.phoneNumber),
			),
		).toBe(true);
	});

	it('should sent a sms message with the "verify-sms.code-message" translation', async () => {
		const f = await Fixture();
		await f.verifySMS.sendCode({
			phoneNumber: f.phoneNumber,
		});
		expect(
			f.sms.sent[0]?.message ===
				f.translator("verify-sms.code-message", f.CODE),
		).toBe(true);
	});

	it("should fail if the code is not the same as the code sent", async () => {
		const f = await Fixture();

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.withDefault(sent, null)?.verificationId;

		if (!verificationId) {
			throw new Error("Invalid verification id");
		}

		const verified = await f.verifySMS.verifyCode({
			verificationId: verificationId,
			code: f.WRONG_CODE,
		});

		expect(isErr(verified) && verified.error.t === "code-incorrect").toBe(true);
	});

	it("should eventually error after enough failed attempts", async () => {
		const f = await Fixture({ verifyCodeMaxAttempts: 1 });

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.unwrap(sent).verificationId;

		await f.verifySMS.verifyCode({
			verificationId,
			code: f.WRONG_CODE,
		});
		const verified = await f.verifySMS.verifyCode({
			verificationId,
			code: f.WRONG_CODE,
		});
		expect(
			isErr(verified) &&
				verified.error.t === "verification-expired-too-many-failed-attempts",
		).toBe(true);
	});

	it("should error if the verification id is not found", async () => {
		const f = await Fixture();

		await f.verifySMS.sendCode(f);

		const verified = await f.verifySMS.verifyCode({
			verificationId: VerificationId.generate(),
			code: f.CODE,
		});

		expect(
			isErr(verified) && verified.error.t === "verification-not-found",
		).toBe(true);
	});

	it("should error if verification expired", async () => {
		const verifyCodeExpiresIn = TimeSpan.fromMinutes(5);

		let now = Posix.now();

		const f = await Fixture({ verifyCodeExpiresIn, now: () => now });

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.unwrap(sent).verificationId;

		now = Posix.add(now, verifyCodeExpiresIn);

		const verified = await f.verifySMS.verifyCode({
			verificationId,
			code: f.CODE,
		});

		expect(isErr(verified) && verified.error.t === "verification-expired").toBe(
			true,
		);
	});

	it("should error sending code if hourly limit is reached", async () => {
		const sendCodeHourlyLimit = 3;
		const f = await Fixture({ sendCodeHourlyLimit });
		for (let i = 0; i < sendCodeHourlyLimit; i++) {
			await f.verifySMS.sendCode({
				phoneNumber: f.phoneNumber,
			});
		}
		const sent = await f.verifySMS.sendCode({
			phoneNumber: f.phoneNumber,
		});
		expect(sent.t).toBe("err");
		if (isErr(sent)) expect(sent.error.t).toBe("hourly-limit-reached");
	});

	it("should let user send code again after it has been over an hour after they hit the limit", async () => {
		const sendCodeHourlyLimit = 3;
		let now = Posix.now();
		const f = await Fixture({ sendCodeHourlyLimit, now: () => now });
		for (let i = 0; i < sendCodeHourlyLimit; i++) {
			await f.verifySMS.sendCode({ phoneNumber: f.phoneNumber });
		}
		now = Posix.add(
			now,
			TimeSpan.add(TimeSpan.fromHours(1), TimeSpan.fromMilliseconds(1)),
		);
		const sent = await f.verifySMS.sendCode({ phoneNumber: f.phoneNumber });
		expect(isOk(sent)).toBe(true);
	});

	it("should only apply hourly limit to a single phone number", async () => {
		const sendCodeHourlyLimit = 3;

		const f = await Fixture({ sendCodeHourlyLimit });

		const phoneNumberA = Result.unwrap(
			PhoneNumber.fromString("+1 480-209-8698"),
		);
		const phoneNumberB = Result.unwrap(
			PhoneNumber.fromString("+1 480-209-8699"),
		);

		for (let i = 0; i < sendCodeHourlyLimit + 1; i++) {
			await f.verifySMS.sendCode({ phoneNumber: phoneNumberA });
		}
		const sent = await f.verifySMS.sendCode({ phoneNumber: phoneNumberB });
		expect(isOk(sent)).toBe(true);
	});
});
