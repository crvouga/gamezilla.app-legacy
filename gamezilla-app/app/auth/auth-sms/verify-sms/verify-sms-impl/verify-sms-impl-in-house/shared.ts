import { Posix, TimeSpan } from "gamezilla-app/@/core";
import type { IHashing } from "gamezilla-app/@/hashing";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import { ISMS } from "gamezilla-app/app/@/server/sms";
import { IVerificationAttemptDb } from "../../verification-attempt";
import { IVerificationCodeGenerator } from "../../verification-code-generator";
import type { IVerificationDb } from "../../verification/verification-db";

export type Deps = {
	logger: ILogger;
	sms: ISMS;
	verificationCodeGenerator: IVerificationCodeGenerator;
	verificationDb: IVerificationDb;
	verificationAttemptDb: IVerificationAttemptDb;
	Translator: (lang: LanguageCodeISO_639_1) => Translator;
	hashing: IHashing;
	now: () => Posix;
	verifyCodeMaxAttempts: number;
	verifyCodeExpiresIn: TimeSpan;
	sendCodeHourlyLimit: number;
	sendCodeDailyLimit: number;
};
