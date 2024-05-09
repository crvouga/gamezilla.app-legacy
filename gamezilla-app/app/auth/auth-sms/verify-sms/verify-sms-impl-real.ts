import { Err, Ok, Posix, TimeSpan, isErr } from "gamezilla-app/@/core";
import type { IHashing } from "gamezilla-app/@/hashing";
import type { Translator } from "gamezilla-app/@/l18n/generated";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import type { ISMS } from "gamezilla-app/app/@/server/sms";
import type { ICodeGenerator } from "./code-generator";
import {
	VerificationId,
	type Verification,
	type VerificationAttempt,
} from "./verification";
import type { IVerificationDb } from "./verification-db";
import { VerificationAttemptId } from "./verification/verification-attempt-id";
import type { IVerifySMS } from "./verify-sms";

export type VerifySMSDeps = {
	logger: ILogger;
	sms: ISMS;
	codeGenerator: ICodeGenerator;
	verificationDb: IVerificationDb;
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
						">=": Posix.sub(now, TimeSpan.fromDays(1)),
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
						">=": Posix.sub(now, TimeSpan.fromHours(1)),
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

			const code = deps.codeGenerator.generate();

			const codeHash = await deps.hashing.hash({
				algo: {
					t: "sha256",
				},
				password: code,
			});

			const verificationNew: Verification = {
				codeHash: codeHash,
				phoneNumber: input.phoneNumber,
				createdAt: deps.now(),
				expiresIn: deps.verifyCodeExpiresIn,
				verificationId: VerificationId.generate(),
				verifiedAt: null,
			};

			const upserted = await deps.verificationDb.upsert(verificationNew);

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

			if (
				TimeSpan.gte(
					Posix.diff(deps.now(), verification.createdAt),
					verification.expiresIn,
				)
			) {
				return Err({
					t: "verification-expired",
				});
			}

			const foundAttempts = await deps.verificationDb.attempts.find({
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

			const attempts = foundAttempts.value;

			if (attempts.length >= deps.verifyCodeMaxAttempts) {
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

			await deps.verificationDb.attempts.upsert(newAttempt);

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

			await deps.verificationDb.upsert(verificationNew);

			return Ok({
				phoneNumber: verification.phoneNumber,
			});
		},
	};
};
