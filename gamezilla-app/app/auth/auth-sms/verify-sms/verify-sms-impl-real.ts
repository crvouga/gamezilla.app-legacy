import { Err, Ok, Posix, TimeSpan, isErr } from "gamezilla-app/@/core";
import type { IHashing } from "gamezilla-app/@/hashing";
import type { Translator } from "gamezilla-app/@/l18n/generated";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import type { ISMS } from "gamezilla-app/app/@/server/sms";
import type { IVerificationCodeGenerator } from "./verification-code-generator";
import {
	VerificationId,
	type Verification,
} from "./verification";
import type { IVerificationDb } from "./verification/verification-db";
import type { IVerifySMS } from "./verify-sms";
import { IVerificationAttemptDb, VerificationAttempt, VerificationAttemptId } from "./verification-attempt";

export type VerifySMSDeps = {
	logger: ILogger;
	sms: ISMS;
	verificationCodeGenerator: IVerificationCodeGenerator;
	verificationDb: IVerificationDb;
	verificationAttemptDb: IVerificationAttemptDb;
	translator: Translator;
	hashing: IHashing;
	now: () => Posix;
	verifyCodeMaxAttempts: number;
	verifyCodeExpiresIn: TimeSpan;
	sendCodeHourlyLimit: number;
	sendCodeDailyLimit: number;
};

export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
	return {
		async sendCode(input) {
			const now = deps.now();

			const lastDayVerifications = await deps.verificationDb.find({
				where: {
					createdAt: {
						"<=": now,
						">=": Posix.past(now, TimeSpan.days(1)),
					},
					phoneNumber: {
						"=": input.phoneNumber,
					},
				},
			});

			if (isErr(lastDayVerifications)) {
				return Err({
					t: "database-error",
					error: lastDayVerifications.error,
				});
			}

			if (lastDayVerifications.value.items.length >= deps.sendCodeDailyLimit) {
				return Err({
					t: "daily-limit-reached",
				});
			}

			const lastHourVerifications = await deps.verificationDb.find({
				where: {
					createdAt: {
						"<=": now,
						">=": Posix.past(now, TimeSpan.hours(1)),
					},
					phoneNumber: {
						"=": input.phoneNumber,
					},
				},
			});

			if (isErr(lastHourVerifications)) {
				return Err({
					t: "database-error",
					error: lastHourVerifications.error,
				});
			}

			if (
				lastHourVerifications.value.items.length >= deps.sendCodeHourlyLimit
			) {
				return Err({
					t: "hourly-limit-reached",
				});
			}

			const code = deps.verificationCodeGenerator.generate();

			const codeHash = await deps.hashing.hash({
				algo: {
					t: "sha256",
				},
				password: code,
			});

			const createdAt = deps.now();

			const verificationNew: Verification = {
				codeHash: codeHash,
				phoneNumber: input.phoneNumber,
				createdAt,
				expiresAt: Posix.future(createdAt, deps.verifyCodeExpiresIn),
				verificationId: VerificationId.generate(),
				verifiedAt: null,
			};

			const upserted = await deps.verificationDb.put(verificationNew);

			if (isErr(upserted)) {
				return Err({
					t: "database-error",
					error: upserted.error,
				});
			}

			const sent = await deps.sms.sendMessage({
				message: deps.translator("verify-sms.code-message", code),
				phoneNumber: input.phoneNumber,
			});

			if (isErr(sent)) {
				return Err({
					t: "database-error",
					error: sent.error,
				});
			}

			return Ok({
				verificationId: verificationNew.verificationId,
			});
		},

		async verifyCode(input) {
			const found = await deps.verificationDb.find({
				where: {
					verificationId: {
						"=": input.verificationId,
					},
				},
			});

			if (isErr(found)) {
				return Err({
					t: "database-error",
					error: found.error,
				});
			}

			const verification = found.value.items[0];

			if (!verification) {
				return Err({
					t: "verification-not-found",
				});
			}

			if (verification.verifiedAt) {
				return Err({
					t: "verification-already-verified",
				});
			}

			if (deps.now() >= verification.expiresAt) {
				return Err({
					t: "verification-expired",
				});
			}

			const foundAttempts = await deps.verificationAttemptDb.find({
				where: {
					verificationId: {
						"=": input.verificationId,
					},
				},
			});

			if (isErr(foundAttempts)) {
				return Err({
					t: "database-error",
					error: foundAttempts.error,
				});
			}

			if (foundAttempts.value.length >= deps.verifyCodeMaxAttempts) {
				return Err({
					t: "verification-expired-too-many-failed-attempts",
				});
			}

			const inputtedCodeHash = await deps.hashing.hash({
				algo: {
					t: "sha256",
				},
				password: input.code,
			});

			const newAttempt: VerificationAttempt = {
				verificationAttemptId: VerificationAttemptId.generate(),
				codeHash: inputtedCodeHash,
				createdAt: Posix.now(),
				verificationId: input.verificationId,
			};

			await deps.verificationAttemptDb.put(newAttempt);

			const isCorrect = await deps.hashing.check({
				hash: verification.codeHash,
				password: input.code,
			});

			if (!isCorrect) {
				return Err({
					t: "code-incorrect",
				});
			}

			const verificationNew: Verification = {
				...verification,
				verifiedAt: deps.now(),
			};

			await deps.verificationDb.put(verificationNew);

			return Ok({
				phoneNumber: verification.phoneNumber,
			});
		},
	};
};
