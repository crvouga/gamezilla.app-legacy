import type {
	Iso3166Alpha2Code,
	PhoneNumber,
	Posix,
	Remote,
} from "gamezilla-app/@/core";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import { ServerEvent } from "gamezilla-app/app/@/server";
import type { SendCodeOutput, VerifyCodeOutput } from "./verify-sms";
import type { VerificationId } from "./verify-sms/verification";

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
	inputtedPhoneNumber: string;
	phoneNumberError: string | null;
	countryCodeInput: Iso3166Alpha2Code;
	//
	inputtedCode: string;
	inputtedCodeError: string | null;
	//
	sentCodeAt: Posix | null;
	sendCode: Remote | SendCodeOutput;
	//
	verifiedCodeAt: Posix | null;
	verifyCode: Remote | VerifyCodeOutput;
};

export type MsgClient =
	| { t: "clicked-back-button" }
	| { t: "inputted-phone-number"; phoneNumber: string }
	| { t: "inputted-country-code"; countryCode: Iso3166Alpha2Code }
	| { t: "clicked-phone-number-clear" }
	| { t: "user-clicked-send-code-button" }
	| { t: "inputted-code"; inputtedCode: string }
	| { t: "clicked-code-clear" }
	| { t: "user-clicked-verify-code-button"; phoneNumber: PhoneNumber }
	| { t: "time-passed"; now: Posix };

export type MsgServer = { t: "noop" };

export type MsgToServer =
	| {
			t: "user-clicked-send-code-button";
			phoneNumber: PhoneNumber;
	  }
	| {
			t: "user-clicked-verify-code-button";
			verificationId: VerificationId;
			inputtedCode: string;
	  };

export type MsgToClient =
	| {
			t: "sent-code";
			phoneNumber: PhoneNumber;
			sent: SendCodeOutput;
	  }
	| {
			t: "verified-code";
			verified: VerifyCodeOutput;
	  };

export type AuthSMSServerEvent =
	| ServerEvent
	| {
			t: "auth-sms.user-authenticated-with-sms";
			sessionId: SessionId;
			clientId: ClientId;
			phoneNumber: PhoneNumber;
	  };
