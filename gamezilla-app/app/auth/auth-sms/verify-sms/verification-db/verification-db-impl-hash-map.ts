import { Ok, eq } from "gamezilla-app/@/core";
import type {
	Verification,
	VerificationAttempt,
	VerificationId,
} from "../verification";
import { VerificationAttemptId } from "../verification/verification-attempt-id";
import type { IVerificationDb } from "./verification-db";

export const VerificationDbHashMap = (): IVerificationDb => {
	const verifications = new Map<VerificationId, Verification>();
	const verificationAttempts = new Map<
		VerificationAttemptId,
		VerificationAttempt
	>();
	return {
		async find(input) {
			const filtered = Array.from(verifications.values())
				.filter((v) => {
					if (input.where.verificationId?.["="]) {
						return input.where.verificationId?.["="] === v.verificationId;
					}
					return true;
				})
				.filter((v) => {
					if (input.where.createdAt?.["<="]) {
						return v.createdAt <= input.where.createdAt?.["<="];
					}
					return true;
				})
				.filter((v) => {
					if (input.where.createdAt?.[">="]) {
						return v.createdAt >= input.where.createdAt?.[">="];
					}
					return true;
				})
				.filter((v) => {
					if (input.where.phoneNumber?.["="]) {
						return eq(input.where.phoneNumber?.["="], v.phoneNumber);
					}
					return true;
				});
			const limit = input.limit ?? Infinity;
			const offset = input.offset ?? 0;
			const sliced = filtered.slice(offset, offset + limit);
			return Ok({
				items: sliced,
				total: filtered.length,
				limit: limit,
				offset: offset,
			});
		},
		async upsert(verification) {
			verifications.set(verification.verificationId, verification);
			return Ok(null);
		},
		attempts: {
			async upsert(attempt) {
				verificationAttempts.set(attempt.verificationAttemptId, attempt);
				return Ok(null);
			},
			async find(input) {
				const filtered = Array.from(verificationAttempts.values()).filter(
					(v) => {
						if (input.where.verificationId?.["="]) {
							return input.where.verificationId?.["="] === v.verificationId;
						}
						return true;
					},
				);
				return Ok(filtered);
			},
		},
	};
};
