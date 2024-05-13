import type { IVerifySMS } from "../verify-sms";
import { SendCode } from "./verify-sms-impl-real-send-code";
import { VerifySMSDeps } from "./shared";
import { VerifyCode } from "./verify-sms-impl-real-verify-code";

export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
	return {
		sendCode: SendCode(deps),
		verifyCode: VerifyCode(deps),
	};
};
