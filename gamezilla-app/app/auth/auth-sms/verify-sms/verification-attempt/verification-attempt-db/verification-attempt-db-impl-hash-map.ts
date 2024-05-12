import { Ok } from "gamezilla-app/@/core";
import type { IVerificationAttemptDb } from "./verification-attempt-db";
import { VerificationAttemptId } from "../verification-attempt-id";
import { VerificationAttempt } from "../verification-attempt";

export const VerificationAttemptDbHashMap = (): IVerificationAttemptDb => {
	const verificationAttempts = new Map<
		VerificationAttemptId,
		VerificationAttempt
	>();
	return {
		async insert(attempt) {
			verificationAttempts.set(attempt.verificationAttemptId, attempt);
			return Ok(null);
		},
		async find(input) {
			const filtered = Array.from(verificationAttempts.values()).filter((v) => {
				if (input.where?.verificationId?.["="]) {
					return input.where?.verificationId?.["="] === v.verificationId;
				}
				return true;
			});
			return Ok(filtered);
		},
	};
};
