import { Err, Ok, Posix, TimeSpan, isErr } from "gamezilla-app/@/core";
import { VerificationId, type Verification } from "../verification";
import type { IVerifySMS } from "../verify-sms";
import { VerifySMSDeps } from "./shared";

export const SendCode =
	(deps: VerifySMSDeps): IVerifySMS["sendCode"] =>
	async (input) => {
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

		if (lastHourVerifications.value.items.length >= deps.sendCodeHourlyLimit) {
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
	};
