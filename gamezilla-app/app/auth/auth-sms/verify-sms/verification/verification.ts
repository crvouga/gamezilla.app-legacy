import type { Posix, TimeSpan } from "gamezilla-app/@shared/core";
import type { Hash } from "gamezilla-app/@shared/hashing";
import type { VerificationAttemptId } from "./verification-attempt-id";
import type { VerificationId } from "./verification-id";

export type Verification = {
	verificationId: VerificationId;
	codeHash: Hash;
	phoneNumberHash: Hash;
	createdAt: Posix;
	expiresIn: TimeSpan;
	verifiedAt: Posix | null;
};

export type VerificationAttempt = {
	verificationAttemptId: VerificationAttemptId;
	verificationId: VerificationId;
	codeHash: Hash;
	createdAt: Posix;
};
