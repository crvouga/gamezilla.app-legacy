import { Err, Ok, isErr } from "gamezilla-app/@/core";
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

		const verification = found.value.items[0] ?? null;

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

		const previousAttempts = await deps.verificationAttemptDb.find({
			where: {
				verificationId: {
					"=": input.verificationId,
				},
			},
		});

		if (isErr(previousAttempts)) {
			return Err({
				t: "database-error",
				error: previousAttempts.error,
			});
		}

		if (previousAttempts.value.length >= deps.verifyCodeMaxAttempts) {
			return Err({
				t: "verification-expired-too-many-failed-attempts",
			});
		}

		const codeHash = await deps.hashing.hash({
			algo: {
				t: "sha256",
			},
			password: input.code,
		});

		const newAttempt: VerificationAttempt = {
			verificationAttemptId: VerificationAttemptId.generate(),
			codeHash,
			createdAt: deps.now(),
			verificationId: input.verificationId,
		};

		await deps.verificationAttemptDb.insert(newAttempt);

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

		return Ok(verification);
	};
