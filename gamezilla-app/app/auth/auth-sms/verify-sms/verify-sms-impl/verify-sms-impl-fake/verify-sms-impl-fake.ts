import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import { VerificationId } from "../../verification";
import type { IVerifySMS } from "../../verify-sms";

const DEFAULT_CODE = "123";

export type VerifySMSDeps = {
	logger?: ILogger;
	delay?: () => Promise<void>;
	verificationId?: VerificationId;
	code?: string;
};

export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
	const phoneNumbers = new Map<VerificationId, PhoneNumber>();

	return {
		async sendCode(input) {
			await deps.delay?.();

			const verificationId = deps.verificationId ?? VerificationId.generate();

			phoneNumbers.set(verificationId, input.phoneNumber);

			const phoneNumberStr = PhoneNumber.toString(input.phoneNumber);

			deps.logger?.info(
				`[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${DEFAULT_CODE}`,
			);

			return Ok({
				verificationId,
			});
		},
		async verifyCode(input) {
			await deps.delay?.();

			const phoneNumber = phoneNumbers.get(input.verificationId);

			if (!phoneNumber) {
				return Err({
					t: "verification-not-found",
				});
			}

			const code = deps.code ?? DEFAULT_CODE;
			if (code === DEFAULT_CODE) {
				return Ok({
					phoneNumber,
				});
			}

			return Err({
				t: "code-incorrect",
			});
		},
	};
};
