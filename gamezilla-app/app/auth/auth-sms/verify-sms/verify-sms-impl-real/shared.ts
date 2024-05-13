import { Posix, TimeSpan } from "gamezilla-app/@/core";
import type { IHashing } from "gamezilla-app/@/hashing";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import { IVerificationAttemptDb } from "../verification-attempt";
import type { IVerificationDb } from "../verification/verification-db";
import { IVerifySMSProvider } from "./verify-sms-provider";

export type VerifySMSDeps = {
	logger: ILogger;
	// sms: ISMS;
	// verificationCodeGenerator: IVerificationCodeGenerator;
	verificationDb: IVerificationDb;
	verificationAttemptDb: IVerificationAttemptDb;
	// Translator: (lang: LanguageCodeISO_639_1) => Translator;
	hashing: IHashing;
	now: () => Posix;
	verifyCodeMaxAttempts: number;
	verifyCodeExpiresIn: TimeSpan;
	sendCodeHourlyLimit: number;
	sendCodeDailyLimit: number;
	provider: IVerifySMSProvider;
};
