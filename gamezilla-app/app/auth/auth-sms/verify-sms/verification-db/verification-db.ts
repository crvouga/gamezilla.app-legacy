import type { PhoneNumber, Posix, Task } from "gamezilla-app/@/core";
import { Paginated } from "gamezilla-app/app/@/data";
import type {
	Verification,
	VerificationAttempt,
	VerificationId,
} from "../verification";

export type IVerificationDb = {
	find(input: {
		where: {
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
		limit?: number;
		offset?: number;
	}): Task<string, Paginated<Verification>>;
	upsert(verification: Verification): Task<string, null>;
	attempts: {
		find(input: {
			where: {
				verificationId?: {
					"=": VerificationId;
				};
			};
		}): Task<string, VerificationAttempt[]>;
		upsert(attempt: VerificationAttempt): Task<string, null>;
	};
};
