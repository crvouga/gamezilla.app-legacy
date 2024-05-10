import { PhoneNumber, Posix, TimeSpan } from "gamezilla-app/@/core";
import { Hash, Hashing } from "gamezilla-app/@/hashing";
import type { VerificationAttemptId } from "./verification-attempt-id";
import { VerificationId } from "./verification-id";

export type Verification = {
	verificationId: VerificationId;
	codeHash: Hash;
	phoneNumber: PhoneNumber;
	createdAt: Posix;
	expiresAt: Posix;
	verifiedAt: Posix | null;
};

export type VerificationAttempt = {
	verificationAttemptId: VerificationAttemptId;
	verificationId: VerificationId;
	codeHash: Hash;
	createdAt: Posix;
};

export const randomVerification = async (input?: {
	createdAt?: Posix;
}): Promise<Verification> => {
	const createdAt = input?.createdAt ?? Posix.now();
	return {
		verificationId: VerificationId.generate(),
		codeHash: await Hashing({ t: "noop" }).hash({
			algo: { t: "sha256" },
			password: "123",
		}),
		phoneNumber: PhoneNumber.random(),
		createdAt,
		expiresAt: Posix.add(createdAt, TimeSpan.fromMinutes(1)),
		verifiedAt: null,
	};
};
