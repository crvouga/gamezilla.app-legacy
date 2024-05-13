import { PhoneNumber, Posix, TimeSpan } from "gamezilla-app/@/core";
import { Hash, Hashing } from "gamezilla-app/@/hashing";
import { VerificationId } from "./verification-id";

export type Verification = {
	verificationId: VerificationId;
	codeHash: Hash | null;
	phoneNumber: PhoneNumber;
	createdAt: Posix;
	expiresAt: Posix;
	verifiedAt: Posix | null;
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
		expiresAt: Posix.future(createdAt, TimeSpan.minutes(1)),
		verifiedAt: null,
	};
};
