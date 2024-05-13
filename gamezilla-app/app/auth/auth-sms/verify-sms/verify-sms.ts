import type { PhoneNumber, Task } from "gamezilla-app/@/core";
import type { Translator } from "gamezilla-app/@/l18n/generated";
import type { VerificationId } from "./verification";
import type { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";

export type VerifyCodeProblem =
	| {
			t: "code-incorrect";
	  }
	| {
			t: "verification-expired";
	  }
	| {
			t: "verification-expired-too-many-failed-attempts";
	  }
	| {
			t: "verification-expired-not-latest-verifcation";
	  }
	| {
			t: "verification-not-found";
	  }
	| {
			t: "verification-already-verified";
	  }
	| {
			t: "database-error";
			error: string;
	  };

export const verifyCodeProblemToString = ({
	problem,
	t,
}: {
	problem: VerifyCodeProblem;
	t: Translator;
}): string => {
	switch (problem.t) {
		case "code-incorrect":
			return t("verify-sms-problem.code-incorrect");
		case "verification-expired":
			return t("verify-sms-problem.verification-expired");
		case "verification-not-found":
			return t("verify-sms-problem.verification-not-found");
		case "verification-already-verified":
			return t("verify-sms-problem.verification-already-verified");
		case "database-error":
			return t("verify-sms-problem.database-error");
		case "verification-expired-too-many-failed-attempts":
			return t(
				"verify-sms-problem.verification-expired-too-many-failed-attempts",
			);
		case "verification-expired-not-latest-verifcation":
			return t(
				"verify-sms-problem.verification-expired-not-latest-verifcation",
			);
	}
};

export type SendCodeProblem =
	| {
			t: "database-error";
			error: string;
	  }
	| {
			t: "hourly-limit-reached";
	  }
	| {
			t: "daily-limit-reached";
	}
	| {
		  t: 'limit-reached'
	  }

export const sendCodeProblemToString = ({
	problem,
	t,
}: {
	problem: SendCodeProblem;
	t: Translator;
}): string => {
	switch (problem.t) {
		case "database-error":
			return t("verify-sms-problem.database-error");
		case "hourly-limit-reached":
			return t("verify-sms-problem.send-code-hourly-limit-reached");
		case "daily-limit-reached":
			return t("verify-sms-problem.send-code-daily-limit-reached");
		case 'limit-reached':
			return t('verify-sms-problem.send-code-limit-reached')
	}
};

export type IVerifySMS = {
	sendCode: (input: {
		phoneNumber: PhoneNumber;
		perferredLanguage: LanguageCodeISO_639_1;
	}) => Task<SendCodeProblem, { verificationId: VerificationId }>;
	verifyCode: (input: {
		verificationId: VerificationId;
		code: string;
	}) => Task<VerifyCodeProblem, { phoneNumber: PhoneNumber }>;
};

export type SendCodeOutput = Awaited<ReturnType<IVerifySMS["sendCode"]>>;

export type VerifyCodeOutput = Awaited<ReturnType<IVerifySMS["verifyCode"]>>;
