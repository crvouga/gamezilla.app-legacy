import type {
	Iso3166Alpha2Code,
	PhoneNumber,
	Posix,
	RemoteResult,
	Result,
} from "gamezilla-app/@/core";
import type { VerificationId } from "./verify-sms/verification";
import type { VerifyCodeProblem } from "./verify-sms/verify-sms";

export type Route =
	| {
			t: "/";
	  }
	| {
			t: "/verify";
			phoneNumber: PhoneNumber;
	  };

export type ModelClient = {
	//
	phoneNumberInput: string;
	phoneNumberError: string | null;
	countryCodeInput: Iso3166Alpha2Code;
	//
	codeInput: string;
	codeError: string | null;
	//
	sentCodeAt: Posix | null;
	sendCode: RemoteResult<string, { verificationId: VerificationId }>;
	//
	verifiedCodeAt: Posix | null;
	verifyCode: RemoteResult<VerifyCodeProblem, null>;
};

export type MsgClient =
	| { t: "clicked-back-button" }
	| { t: "inputted-phone-number"; phoneNumber: string }
	| { t: "inputted-country-code"; countryCode: Iso3166Alpha2Code }
	| { t: "clicked-phone-number-clear" }
	| { t: "clicked-send-code" }
	| { t: "inputted-code"; code: string }
	| { t: "clicked-code-clear" }
	| { t: "clicked-verify-code"; phoneNumber: PhoneNumber }
	| { t: "time-passed"; now: Posix };

export type MsgServer = { t: "noop" };

export type MsgToServer =
	| {
			t: "send-code";
			phoneNumber: PhoneNumber;
	  }
	| {
			t: "verify-code";
			verificationId: VerificationId;
			code: string;
	  };

export type MsgToClient =
	| {
			t: "sent-code";
			phoneNumber: PhoneNumber;
			result: Result<
				string,
				{
					verificationId: VerificationId;
				}
			>;
	  }
	| {
			t: "verified-code";
			result: Result<VerifyCodeProblem, null>;
	  };
