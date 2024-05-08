import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { IHashing } from "gamezilla-app/@/hashing";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import { VerificationId } from "./verification";
import type { IVerifySMS } from "./verify-sms";

const CODE = "123";

export type VerifySMSDeps = {
	hashing: IHashing;
	logger: ILogger;
	delay: () => Promise<void>;
};

const phoneNumbers = new Map<VerificationId, PhoneNumber>();
export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
	return {
		async sendCode(input) {
			await deps.delay();

			const verificationId = VerificationId.generate();

			phoneNumbers.set(verificationId, input.phoneNumber);

			const phoneNumberStr = PhoneNumber.toString(input.phoneNumber);

			deps.logger.info(
				`[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${CODE}`,
			);

			return Ok({
				verificationId,
			});
		},
		async verifyCode(input) {
			await deps.delay();

			const phoneNumber = phoneNumbers.get(input.verificationId);

			if (!phoneNumber) {
				return Err({
					t: "verification-not-found",
				});
			}

			if (input.code === CODE) {
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
