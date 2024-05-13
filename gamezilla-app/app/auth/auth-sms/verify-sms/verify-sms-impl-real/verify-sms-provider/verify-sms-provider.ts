import { PhoneNumber, Task } from "gamezilla-app/@/core";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import { SendCodeProblem, VerifyCodeProblem } from "../../verify-sms";

export type IVerifySMSProvider = {
	sendCode: (input: {
		phoneNumber: PhoneNumber;
		perferredLanguage: LanguageCodeISO_639_1;
	}) => Task<SendCodeProblem, null>;
	verifyCode: (input: { phoneNumber: PhoneNumber; code: string }) => Task<
		VerifyCodeProblem,
		{ phoneNumber: PhoneNumber }
	>;
};
