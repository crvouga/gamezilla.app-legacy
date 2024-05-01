import { describe, expect, it } from "bun:test";
import { getTranslator } from "gamezilla-app/app/@shared/client/translator";
import { DbConnKv } from "gamezilla-app/app/@shared/server/db-conn-kv";
import { SMSFake } from "gamezilla-app/app/@shared/server/sms/sms-impl-fake";
import {
	PhoneNumber,
	Result,
	eq,
	isErr,
	isOk,
} from "gamezilla-app/@shared/core";
import { Hashing } from "gamezilla-app/@shared/hashing";
import { CodeGenerator } from "./code-generator";
import { VerificationId } from "./verification";
import { VerificationAttemptDb, VerificationDb } from "./verification-db";
import { VerifySMS } from "./verify-sms-impl";
import { Logger } from "gamezilla-app/app/@shared/server/logger";

const Fixture = async () => {
	const sms = SMSFake();

	const dbConnKv = await DbConnKv({ t: "hash-map" });

	const CODE = "123456";
	const WRONG_CODE = "42";

	const codeGenerator = CodeGenerator({ t: "fake", code: CODE });

	const logger = Logger({ t: "noop" });

	const translator = getTranslator("en");

	const verifySMS = VerifySMS({
		t: "real",
		dbConnKv,
		logger,
		sms,
		codeGenerator,
		translator,
		verificationAttemptDb: VerificationAttemptDb({
			t: "hash-map",
		}),
		verificationDb: VerificationDb({
			t: "hash-map",
		}),
		hashing: Hashing({ t: "noop" }),
	});

	const phoneNumber = Result.withDefault(
		PhoneNumber.fromString("+1 480-209-8698"),
		null,
	);

	if (!phoneNumber) {
		throw new Error("Invalid phone number");
	}

	return {
		translator,
		CODE,
		WRONG_CODE,
		phoneNumber,
		dbConnKv,
		verifySMS,
		sms,
	};
};

describe(import.meta.file, () => {
	it("should be ok", async () => {
		const f = await Fixture();

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.withDefault(sent, null)?.verificationId;

		if (!verificationId) {
			throw new Error("Invalid verification id");
		}

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
		const f = await Fixture();

		const sent = await f.verifySMS.sendCode(f);

		const verificationId = Result.withDefault(sent, null)?.verificationId;

		if (!verificationId) {
			throw new Error("Invalid verification id");
		}

		for (let i = 0; i < 1000; i++) {
			const verified = await f.verifySMS.verifyCode({
				verificationId: verificationId,
				code: f.WRONG_CODE,
			});

			if (isErr(verified) && verified.error.t === "code-incorrect") {
				continue;
			}

			if (
				isErr(verified) &&
				verified.error.t === "verification-expired-too-many-failed-attempts"
			) {
				return;
			}
		}
		throw new Error("Should have eventually errored");
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
});
