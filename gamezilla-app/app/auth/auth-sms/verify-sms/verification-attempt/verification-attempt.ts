import { Posix } from "gamezilla-app/@/core";
import { Hash } from "gamezilla-app/@/hashing";
import type { VerificationAttemptId } from "./verification-attempt-id";
import { VerificationId } from "../verification";

export type VerificationAttempt = {
	verificationAttemptId: VerificationAttemptId;
	verificationId: VerificationId;
	codeHash: Hash;
	createdAt: Posix;
};
