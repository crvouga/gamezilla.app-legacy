import { Err, Ok, Posix, isErr } from "gamezilla-app/@/core";
import { type Verification } from "../verification";
import {
	VerificationAttempt,
	VerificationAttemptId,
} from "../verification-attempt";
import type { IVerifySMS } from "../verify-sms";
import { VerifySMSDeps } from "./shared";

export const VerifyCode =
	(deps: VerifySMSDeps): IVerifySMS["verifyCode"] =>
	async (input) => {
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
	};
