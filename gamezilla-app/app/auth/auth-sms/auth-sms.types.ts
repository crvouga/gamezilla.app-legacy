import type {
	Iso3166Alpha2Code,
	PhoneNumber,
	Posix,
	Remote,
	Result,
} from 'gamezilla-app/@/core';
import type {LanguageCodeISO_639_1} from 'gamezilla-app/@/l18n';
import type {UserAccount} from 'gamezilla-app/app/@/data/account';
import type {SendCodeOutput, VerifyCodeProblem} from './verify-sms';

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

type VerifyCodeOutput = Result<VerifyCodeProblem, UserAccount>;

export type MsgClient =
	| {t: 'clicked-back-button'}
	| {t: 'inputted-phone-number'; phoneNumber: string}
	| {
			t: 'inputted-country-code';
			countryCode: Iso3166Alpha2Code;
	  }
	| {t: 'clicked-phone-number-clear'}
	| {t: 'user-clicked-send-code-button'}
	| {t: 'inputted-code'; inputtedCode: string}
	| {t: 'clicked-code-clear'}
	| {
			t: 'user-clicked-verify-code-button';
			phoneNumber: PhoneNumber;
			inputtedCode: string;
	  }
	| {t: 'time-passed'; now: Posix};

export type MsgServer = {t: 'noop'};

export type MsgToServer =
	| {
			t: 'user-clicked-send-code-button';
			phoneNumber: PhoneNumber;
			preferredLanguage: LanguageCodeISO_639_1;
	  }
	| {
			t: 'user-clicked-verify-code-button';
			phoneNumber: PhoneNumber;
			inputtedCode: string;
	  };

export type MsgToClient =
	| {
			t: 'sent-code';
			phoneNumber: PhoneNumber;
			sent: SendCodeOutput;
	  }
	| {
			t: 'verified-code';
			verified: VerifyCodeOutput;
	  };
