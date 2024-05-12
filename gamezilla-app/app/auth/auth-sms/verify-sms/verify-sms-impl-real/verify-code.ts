import { Err, Ok, Task, isErr } from "gamezilla-app/@/core";
import { VerificationId, type Verification } from "../verification";
import {
	VerificationAttempt,
	VerificationAttemptId,
} from "../verification-attempt";
import type { IVerifySMS, VerifyCodeProblem } from "../verify-sms";
import { VerifySMSDeps } from "./shared";

export const VerifyCode =
	(deps: VerifySMSDeps): IVerifySMS["verifyCode"] =>
	async (input) => {
		const found = await findVerification(deps, input.verificationId);

		if (isErr(found)) {
			return found;
		}

		const validated = await validateVerification(deps, found.value);

		if (isErr(validated)) {
			return validated;
		}

		const verification = validated.value;

		const previousAttempts = await findPreviousAttempts(
			deps,
			input.verificationId,
		);

		if (isErr(previousAttempts)) {
			return previousAttempts;
		}

		const validatedPreviousAttempts = await validatePreviousAttempts(
			deps,
			previousAttempts.value,
		);

		if (isErr(validatedPreviousAttempts)) {
			return validatedPreviousAttempts;
		}

		const recordedAttempt = await recordAttempt(
			deps,
			input.verificationId,
			input.code,
		);

		if (isErr(recordedAttempt)) {
			return recordedAttempt;
		}

		const validatedCode = await validateCode(deps, verification, input.code);

		if (isErr(validatedCode)) {
			return validatedCode;
		}

		const marked = await markAsVerified(deps, verification);

		if (isErr(marked)) {
			return marked;
		}

		return Ok(verification);
	};

const findVerification = async (
	deps: VerifySMSDeps,
	verificationId: VerificationId,
): Task<VerifyCodeProblem, Verification | null> => {
	const found = await deps.verificationDb.find({
		where: {
			verificationId: {
				"=": verificationId,
			},
		},
	});

	if (isErr(found)) {
		return Err({
			t: "database-error",
			error: found.error,
		});
	}

	return Ok(found.value.items[0] ?? null);
};

const validateVerification = async (
	deps: VerifySMSDeps,
	verification: Verification | null,
): Task<VerifyCodeProblem, Verification> => {
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

	return Ok(verification);
};

const findPreviousAttempts = async (
	deps: VerifySMSDeps,
	verificationId: VerificationId,
): Task<VerifyCodeProblem, VerificationAttempt[]> => {
	const foundAttempts = await deps.verificationAttemptDb.find({
		where: {
			verificationId: {
				"=": verificationId,
			},
		},
	});

	if (isErr(foundAttempts)) {
		return Err({
			t: "database-error",
			error: foundAttempts.error,
		});
	}

	return Ok(foundAttempts.value);
};

const validatePreviousAttempts = async (
	deps: VerifySMSDeps,
	attempts: VerificationAttempt[],
): Task<VerifyCodeProblem, null> => {
	if (attempts.length >= deps.verifyCodeMaxAttempts) {
		return Err({
			t: "verification-expired-too-many-failed-attempts",
		});
	}

	return Ok(null);
};

const recordAttempt = async (
	deps: VerifySMSDeps,
	verificationId: VerificationId,
	inputtedCode: string,
): Task<VerifyCodeProblem, null> => {
	const codeHash = await deps.hashing.hash({
		algo: {
			t: "sha256",
		},
		password: inputtedCode,
	});

	const newAttempt: VerificationAttempt = {
		verificationAttemptId: VerificationAttemptId.generate(),
		codeHash,
		createdAt: deps.now(),
		verificationId,
	};

	await deps.verificationAttemptDb.insert(newAttempt);

	return Ok(null);
};

const validateCode = async (
	deps: VerifySMSDeps,
	verification: Verification,
	inputtedCode: string,
): Task<VerifyCodeProblem, boolean> => {
	const isCorrect = await deps.hashing.check({
		hash: verification.codeHash,
		password: inputtedCode,
	});

	if (!isCorrect) {
		return Err({
			t: "code-incorrect",
		});
	}

	return Ok(true);
};

const markAsVerified = async (
	deps: VerifySMSDeps,
	verification: Verification,
): Task<VerifyCodeProblem, null> => {
	const verificationNew: Verification = {
		...verification,
		verifiedAt: deps.now(),
	};

	await deps.verificationDb.put(verificationNew);

	return Ok(null);
};
