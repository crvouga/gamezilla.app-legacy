import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import twilio from "twilio";
import { IVerifySMSProvider } from "./verify-sms-provider";
import { ILogger } from "gamezilla-app/app/@/server/logger";

export type Deps = {
	logger: ILogger;
};

export const VerifySMSProvider = (deps: Deps): IVerifySMSProvider => {
	const accountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8";
	const authToken = "70a3da99b8052fd3b4fbef13af0cb987";
	const serviceId = "VAe4a5dc015a0c79ed89a84074e8f3f7f5";
	const client = twilio(accountSid, authToken);
	return {
		async sendCode(input) {
			try {
				const to = PhoneNumber.toString(input.phoneNumber);
				deps.logger.info(`Sending code to ${to}`);
				await Promise.race([
					client.verify.v2.services(serviceId).verifications.create({
						channel: "sms",
						to,
					}),
					new Promise((r) => setTimeout(r, 3000)),
				]);
				deps.logger.info(`Sent code to ${to}}`);
				return Ok(null);
			} catch (error) {
				return Err({
					t: "database-error",
					error: String(error),
				});
			}
		},

		async verifyCode(input) {
			try {
				const to = PhoneNumber.toString(input.phoneNumber);
				deps.logger.info(`Verifying code for ${to}`);
				const checked = await client.verify.v2
					.services(serviceId)
					.verificationChecks.create({
						to,
						code: input.code,
					});

				if (checked.valid) {
					return Ok({
						phoneNumber: input.phoneNumber,
					});
				}

				return Err({
					t: "code-incorrect",
				});
			} catch (error) {
				return Err({
					t: "database-error",
					error: String(error),
				});
			}
		},
	};
};
