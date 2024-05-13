import { describe, expect, it } from "bun:test";
import {
	PhoneNumber,
	Posix,
	TimeSpan,
	eq,
	isErr,
	isOk,
	unwrap,
} from "gamezilla-app/@/core";
import { Hashing, type IHashing } from "gamezilla-app/@/hashing";
import type { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/app/@/client/translator";
import { Logger } from "gamezilla-app/app/@/server/logger";
import { SMSFake } from "gamezilla-app/app/@/server/sms/sms-impl-fake";
import { VerificationId } from "../../verification";
import { VerificationAttemptDb } from "../../verification-attempt";
import {
	VerificationCodeGenerator,
	type IVerificationCodeGenerator,
} from "../../verification-code-generator";
import {
	VerificationDb,
	type IVerificationDb,
} from "../../verification/verification-db";
import { VerifySMS } from "../verify-sms-impl";
import { VerifySMSProvider } from "./verify-sms-provider";

const Fixture = async (input?: {
	verifyCodeMaxAttempts?: number;
	verifyCodeExpiresIn?: TimeSpan;
	sendCodeHourlyLimit?: number;
	sendCodeDailyLimit?: number;
	codeGenerator?: IVerificationCodeGenerator;
	now?: () => Posix;
	hashing?: IHashing;
	verificationDb?: IVerificationDb;
}) => {
	const sms = SMSFake({ logger: Logger({ t: "noop" }) });
	const CODE = "123456";
	const WRONG_CODE = "42";
	const verificationCodeGenerator =
		input?.codeGenerator ??
		VerificationCodeGenerator({ t: "fake", code: CODE });
	const logger = Logger({ t: "noop" });
	const verificationDb =
		input?.verificationDb ?? VerificationDb({ t: "hash-map" });
	const verificationAttemptDb = VerificationAttemptDb({ t: "hash-map" });
	const hashing = input?.hashing ?? Hashing({ t: "noop" });

	const verifySMSProvider = VerifySMSProvider({
		t: "in-house",
		hashing,
		logger,
		now: input?.now ?? Posix.now,
		sms,
		verificationCodeGenerator,
		Translator,
		verificationDb,
	});

	const verifySMS = VerifySMS({
		t: "real",
		logger,
		verificationDb,
		verificationAttemptDb,
		hashing,
		now: input?.now ?? Posix.now,
		sendCodeHourlyLimit: input?.sendCodeHourlyLimit ?? 10,
		sendCodeDailyLimit: input?.sendCodeDailyLimit ?? 10,
		verifyCodeExpiresIn: input?.verifyCodeExpiresIn ?? TimeSpan.minutes(5),
		verifyCodeMaxAttempts: input?.verifyCodeMaxAttempts ?? 3,
		provider: verifySMSProvider,
	});

	const phoneNumber = unwrap(PhoneNumber.fromString("+1 480-209-8698"));
	const preferredLanguage: LanguageCodeISO_639_1 = "en";

	return {
		preferredLanguage,
		verificationDb,
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

		const verificationId = unwrap(sent).verificationId;

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
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(f.sms.sent[0]?.message.includes(f.CODE)).toBe(true);
	});

	it("should send a sms message to the phone number inputted", async () => {
		const f = await Fixture();
		await f.verifySMS.sendCode({
			...f,
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
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(
			f.sms.sent[0]?.message ===
				Translator(f.preferredLanguage)("verify-sms.code-message", f.CODE),
		).toBe(true);
	});

	it('should never send an empty sms message with the "verify-sms.code-message" translation', async () => {
		const f = await Fixture();
		await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect((f.sms.sent[0]?.message.length ?? 0) > 0).toBe(true);
	});

	it("should fail if the code is not the same as the code sent", async () => {
		const f = await Fixture();

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = unwrap(sent).verificationId;

		const verified = await f.verifySMS.verifyCode({
			verificationId: verificationId,
			code: f.WRONG_CODE,
		});

		expect(isErr(verified) && verified.error.t === "code-incorrect").toBe(true);
	});

	it("should eventually error after enough failed attempts", async () => {
		const f = await Fixture({ verifyCodeMaxAttempts: 1 });

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = unwrap(sent).verificationId;

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
		const verifyCodeExpiresIn = TimeSpan.minutes(5);

		let now = Posix.now();

		const f = await Fixture({ verifyCodeExpiresIn, now: () => now });

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = unwrap(sent).verificationId;

		now = Posix.future(now, verifyCodeExpiresIn);

		const verified = await f.verifySMS.verifyCode({
			verificationId,
			code: f.CODE,
		});

		expect(isErr(verified) && verified.error.t === "verification-expired").toBe(
			true,
		);
	});

	it("should fail if the code has expired, even if no new code has been sent", async () => {
		const verifyCodeExpiresIn = TimeSpan.minutes(5);

		let now = Posix.now();
		const f = await Fixture({ verifyCodeExpiresIn, now: () => now });

		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		const verificationId = unwrap(sent).verificationId;

		now = Posix.future(now, verifyCodeExpiresIn);
		now = Posix.future(now, TimeSpan.seconds(1));

		const verified = await f.verifySMS.verifyCode({
			verificationId,
			code: f.CODE,
		});

		expect(isErr(verified)).toBe(true);
		isErr(verified) && expect(verified.error.t).toBe("verification-expired");
	});

	it("should error if when verifying after a new code was sent", async () => {
		let now = Posix.now();
		const f = await Fixture({
			now: () => now,
		});

		const sentA = await f.verifySMS.sendCode(f);

		now = Posix.future(now, TimeSpan.seconds(1));

		const sentB = await f.verifySMS.sendCode(f);

		now = Posix.future(now, TimeSpan.seconds(1));

		const verifiedA = await f.verifySMS.verifyCode({
			verificationId: unwrap(sentA).verificationId,
			code: f.CODE,
		});

		now = Posix.future(now, TimeSpan.seconds(1));

		const verifiedB = await f.verifySMS.verifyCode({
			verificationId: unwrap(sentB).verificationId,
			code: f.CODE,
		});

		expect(isErr(verifiedA)).toBe(true);
		isErr(verifiedA) &&
			expect(verifiedA.error.t).toBe(
				"verification-expired-not-latest-verification",
			);
		expect(isOk(verifiedB)).toBe(true);
	});

	it("should error sending code if hourly limit is reached", async () => {
		const sendCodeHourlyLimit = 3;
		const f = await Fixture({ sendCodeHourlyLimit });
		for (let i = 0; i < sendCodeHourlyLimit; i++) {
			await f.verifySMS.sendCode({
				...f,
				phoneNumber: f.phoneNumber,
			});
		}
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(sent.t).toBe("err");
		if (isErr(sent)) expect(sent.error.t).toBe("hourly-limit-reached");
	});

	it("should let user send code again after it has been over an hour after they hit the hourly limit", async () => {
		const sendCodeHourlyLimit = 3;
		let now = Posix.now();
		const f = await Fixture({ sendCodeHourlyLimit, now: () => now });
		for (let i = 0; i < sendCodeHourlyLimit; i++) {
			await f.verifySMS.sendCode({ ...f, phoneNumber: f.phoneNumber });
		}
		now = Posix.future(
			now,
			TimeSpan.add(TimeSpan.hours(1), TimeSpan.milliseconds(1)),
		);
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(isOk(sent)).toBe(true);
	});

	it("should only apply hourly limit to a single phone number", async () => {
		const sendCodeHourlyLimit = 3;

		const f = await Fixture({ sendCodeHourlyLimit });

		const phoneNumberA = unwrap(PhoneNumber.fromString("+1 480-209-8698"));
		const phoneNumberB = unwrap(PhoneNumber.fromString("+1 480-209-8699"));

		for (let i = 0; i < sendCodeHourlyLimit + 1; i++) {
			await f.verifySMS.sendCode({ ...f, phoneNumber: phoneNumberA });
		}
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: phoneNumberB,
		});
		expect(isOk(sent)).toBe(true);
	});

	it("should error sending code if daily limit is reached", async () => {
		const sendCodeDailyLimit = 3;
		const f = await Fixture({ sendCodeDailyLimit });
		for (let i = 0; i < sendCodeDailyLimit; i++) {
			await f.verifySMS.sendCode({
				...f,
				phoneNumber: f.phoneNumber,
			});
		}
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(sent.t).toBe("err");
		if (isErr(sent)) expect(sent.error.t).toBe("daily-limit-reached");
	});

	it("should let user send code again after it has been over a day after they hit the daily limit", async () => {
		const sendCodeDailyLimit = 3;
		let now = Posix.now();
		const f = await Fixture({ sendCodeDailyLimit, now: () => now });
		for (let i = 0; i < sendCodeDailyLimit; i++) {
			await f.verifySMS.sendCode({ ...f, phoneNumber: f.phoneNumber });
		}
		now = Posix.future(
			now,
			TimeSpan.add(TimeSpan.days(1), TimeSpan.milliseconds(1)),
		);
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		expect(isOk(sent)).toBe(true);
	});

	it("should only apply daily limit to a single phone number", async () => {
		const sendCodeDailyLimit = 3;

		const f = await Fixture({ sendCodeDailyLimit });

		const phoneNumberA = unwrap(PhoneNumber.fromString("+1 480-209-8698"));
		const phoneNumberB = unwrap(PhoneNumber.fromString("+1 480-209-8699"));
		for (let i = 0; i < sendCodeDailyLimit + 1; i++) {
			await f.verifySMS.sendCode({ ...f, phoneNumber: phoneNumberA });
		}
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: phoneNumberB,
		});
		expect(isOk(sent)).toBe(true);
	});

	it("should only allow verifications to be used once", async () => {
		const f = await Fixture();
		const sent = unwrap(
			await f.verifySMS.sendCode({ ...f, phoneNumber: f.phoneNumber }),
		);
		const firstVerification = await f.verifySMS.verifyCode({
			verificationId: sent.verificationId,
			code: f.CODE,
		});
		const secondVerification = await f.verifySMS.verifyCode({
			verificationId: sent.verificationId,
			code: f.CODE,
		});
		expect(firstVerification.t).toBe("ok");
		expect(secondVerification.t).toBe("err");
		if (isErr(secondVerification))
			expect(secondVerification.error.t).toBe("verification-already-verified");
	});

	it("should hash sent codes stored in the database", async () => {
		const f = await Fixture({
			hashing: Hashing({ t: "bun" }),
		});
		const sent = await f.verifySMS.sendCode({
			...f,
			phoneNumber: f.phoneNumber,
		});
		const verificationId = unwrap(sent).verificationId;
		const code = f.CODE;
		const verification = await f.verifySMS.verifyCode({ verificationId, code });

		const found = await f.verificationDb.find({
			where: {
				verificationId: {
					"=": verificationId,
				},
			},
		});

		const codeHash = unwrap(found).items[0]?.codeHash?.value;

		expect(isOk(verification)).toBe(true);
		expect(codeHash).not.toEqual(code);
	});

	it("should return database error when database returns an error", async () => {
		const f = await Fixture({
			verificationDb: VerificationDb({ t: "always-err", error: "some error" }),
		});
		const verification = await f.verifySMS.verifyCode({
			verificationId: VerificationId.generate(),
			code: "123",
		});

		expect(verification.t).toBe("err");
		if (isErr(verification))
			expect(verification.error.t).toBe("database-error");
	});
});
