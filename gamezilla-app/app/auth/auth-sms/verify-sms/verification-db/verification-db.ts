import type { PhoneNumber, Posix, Task } from "gamezilla-app/@/core";
import type { Paginated } from "gamezilla-app/app/@/data";
import type {
	Verification,
	VerificationAttempt,
	VerificationId,
} from "../verification";

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

export type IVerificationDb = {
	find(input: {
		where?: WhereClause;
		limit?: number;
		offset?: number;
	}): Task<string, Paginated<Verification>>;
	put(verification: Verification): Task<string, null>;
	attempts: {
		find(input: {
			where: {
				verificationId?: {
					"=": VerificationId;
				};
			};
		}): Task<string, VerificationAttempt[]>;
		put(attempt: VerificationAttempt): Task<string, null>;
	};
};
