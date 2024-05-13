import { PhoneNumber, Task } from "gamezilla-app/@/core";
import { Hash } from "gamezilla-app/@/hashing";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import { SendCodeProblem, VerifyCodeProblem } from "../../verify-sms";

export type IVerifySMSProvider = {
	sendCode: (input: {
		phoneNumber: PhoneNumber;
		perferredLanguage: LanguageCodeISO_639_1;
	}) => Task<SendCodeProblem, { codeHash: Hash }>;
	verifyCode: (input: { phoneNumber: PhoneNumber; code: string }) => Task<
		VerifyCodeProblem,
		{ phoneNumber: PhoneNumber }
	>;
};
