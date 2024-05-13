import { Err, Ok, isErr } from "gamezilla-app/@/core";
import type { Verification } from "../../verification";
import {
    VerificationAttemptId,
    type VerificationAttempt,
} from "../../verification-attempt";
import type { IVerifySMS } from "../../verify-sms";
import type { VerifySMSDeps } from "./shared";

export const VerifyCode =
	(deps: VerifySMSDeps): IVerifySMS["verifyCode"] =>
	async (input) => {
		deps.logger.info(`Verifying code for ${input.verificationId}`);

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

		const foundLatestVerification = await deps.verificationDb.find({
			where: {
				phoneNumber: { "=": verification.phoneNumber },
			},
			order: {
				createdAt: "desc",
			},
		});

		if (isErr(foundLatestVerification)) {
			return Err({
				t: "database-error",
				error: foundLatestVerification.error,
			});
		}

		const latestVerification = foundLatestVerification.value.items[0];

		if (latestVerification?.verificationId !== verification.verificationId) {
			return Err({
				t: "verification-expired-not-latest-verification",
			});
		}

		deps.logger.info(`Checking previous attempts for ${input.verificationId}`);
		const previousAttempts = await deps.verificationAttemptDb.find({
			where: {
				verificationId: {
					"=": input.verificationId,
				},
			},
		});

		if (isErr(previousAttempts)) {
			deps.logger.error(
				`Error checking previous attempts for ${input.verificationId}`,
			);
			return Err({
				t: "database-error",
				error: previousAttempts.error,
			});
		}
		deps.logger.info(
			`Previous attempts for ${input.verificationId}: ${previousAttempts.value.length}`,
		);

		if (previousAttempts.value.length >= deps.verifyCodeMaxAttempts) {
			return Err({
				t: "verification-expired-too-many-failed-attempts",
			});
		}

		const codeHash = await deps.hashing.hash({
			algo: { t: "sha256" },
			password: input.code,
		});

		const newAttempt: VerificationAttempt = {
			verificationAttemptId: VerificationAttemptId.generate(),
			codeHash,
			createdAt: deps.now(),
			verificationId: input.verificationId,
		};

		await deps.verificationAttemptDb.insert(newAttempt);

		const verified = await deps.provider.verifyCode({
			code: input.code,
			phoneNumber: verification.phoneNumber,
		});

		if (isErr(verified)) {
			return verified;
		}

		const verificationNew: Verification = {
			...verification,
			verifiedAt: deps.now(),
		};

		await deps.verificationDb.put(verificationNew);

		return Ok(verification);
	};
