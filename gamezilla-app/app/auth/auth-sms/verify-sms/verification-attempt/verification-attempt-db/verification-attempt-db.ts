import type { Task } from "gamezilla-app/@/core";
import { VerificationId } from "../../verification/verification-id";
import { VerificationAttempt } from "../verification-attempt";

export type WhereClause = {
	verificationId?: {
		"="?: VerificationId;
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
	insert(attempt: VerificationAttempt): Task<string, null>;
};
