import type { PhoneNumber, Posix, Task } from "gamezilla-app/@/core";
import { VerificationId } from "../../verification/verification-id";
import { VerificationAttempt } from "../verification-attempt";

export type WhereClause = {
	verificationId?: {
		"="?: VerificationId;
	};
	createdAt?: {
		"<="?: Posix;
		">="?: Posix;
	};
	phoneNumber?: {
		"="?: PhoneNumber;
	};
};

export type IVerificationAttemptDb = {
	find(input: {
		where: {
			verificationId?: {
				"=": VerificationId;
			};
		};
	}): Task<string, VerificationAttempt[]>;
	put(attempt: VerificationAttempt): Task<string, null>;
};
