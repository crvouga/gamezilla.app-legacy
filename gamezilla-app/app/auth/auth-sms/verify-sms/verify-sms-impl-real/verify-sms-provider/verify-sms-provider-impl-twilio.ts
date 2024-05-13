import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import twilio from "twilio";
import type { IVerifySMSProvider } from "./verify-sms-provider";
import type { ILogger } from "gamezilla-app/app/@/server/logger";

export type Deps = {
	logger: ILogger;
};

export const VerifySMSProvider = (deps: Deps): IVerifySMSProvider => {
	const accountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8";
	const authToken = "70a3da99b8052fd3b4fbef13af0cb987";
	const serviceId = "VAab78c66ef530c74ed41228fa4d33e4d3";
	const client = twilio(accountSid, authToken);
	return {
		async sendCode(input) {
			try {
				const to = PhoneNumber.toString(input.phoneNumber);
				deps.logger.info(`Sending code to ${to}`);

				await client.verify.v2.services(serviceId).verifications.create({
					channel: "sms",
					to,
				});

				deps.logger.info(`Sent code to ${to}}`);
				return Ok(null);
			} catch (error) {
				const twilioCode =
					typeof error === "object" && error && "code" in error
						? Number(error.code)
						: null;

				// https://www.twilio.com/docs/api/errors/60203
				if (twilioCode === 60203) {
					return Err({
						t: "limit-reached",
					});
				}
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
				deps.logger.info(
					`Verified code for ${to} successfully: ${checked.valid}`,
				);

				if (checked.valid) {
					return Ok({
						phoneNumber: input.phoneNumber,
					});
				}

				return Err({
					t: "code-incorrect",
				});
			} catch (error) {
				const twilioCode =
					typeof error === "object" && error && "code" in error
						? Number(error.code)
						: null;

				// https://www.twilio.com/docs/errors/60200
				if (twilioCode === 60200) {
					return Err({
						t: "code-incorrect",
					});
				}

				return Err({
					t: "database-error",
					error: String(error),
				});
			}
		},
	};
};
