import { Err, Ok, PhoneNumber, isErr } from "gamezilla-app/@/core";
import type { IVerifySMSProvider } from "./verify-sms-provider";
import type { ILogger } from "gamezilla-app/app/@/server/logger";
import { p } from "gamezilla-app/@/core/parser";

export type Deps = {
	logger: ILogger;
};

const VerificationCheckBody = p.or(
	p.obj({
		valid: p.bool,
	}),
	p.obj({
		status: p.l(400),
		code: p.num,
	}),
);

export const VerifySMSProvider = (deps: Deps): IVerifySMSProvider => {
	const accountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8";
	const authToken = "70a3da99b8052fd3b4fbef13af0cb987";
	const serviceId = "VAab78c66ef530c74ed41228fa4d33e4d3";
	const authorization = `Basic ${btoa(`${accountSid}:${authToken}`)}`;
	return {
		async sendCode(input) {
			try {
				const to = PhoneNumber.toString(input.phoneNumber);
				deps.logger.info(`Sending code to ${to}`);

				await fetch(
					`https://verify.twilio.com/v2/Services/${serviceId}/Verifications`,
					{
						method: "POST",
						headers: {
							Authorization: authorization,
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							To: to,
							Channel: "sms",
						}),
					},
				);

				deps.logger.info(`Sent code to ${to}}`);
				return Ok(null);
			} catch (error) {
				deps.logger.error(`Errored while sending code: ${error}`);

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

				const response = await fetch(
					`https://verify.twilio.com/v2/Services/${serviceId}/VerificationCheck`,
					{
						method: "POST",
						headers: {
							Authorization: authorization,
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							To: to,
							Code: input.code,
						}),
					},
				);

				const data = await response.json();

				const parsed = VerificationCheckBody.parse(data);

				if (isErr(parsed)) {
					return Err({
						t: "database-error",
						error: String(parsed),
					});
				}

				if ("status" in parsed.value && parsed.value.status === 400) {
					const twilioCode = parsed.value.code;
					// https://www.twilio.com/docs/errors/60200
					if (twilioCode === 60200) {
						return Err({
							t: "code-incorrect",
						});
					}

					return Err({
						t: "database-error",
						error: String(parsed),
					});
				}

				const valid = "valid" in parsed.value ? parsed.value.valid : false;

				deps.logger.info(`Verified code for ${to} successfully: ${valid}`);

				if (valid) {
					return Ok({
						phoneNumber: input.phoneNumber,
					});
				}

				return Err({
					t: "code-incorrect",
				});
			} catch (error) {
				deps.logger.error(`Errored while verifying code: ${error}`);
				return Err({
					t: "database-error",
					error: String(error),
				});
			}
		},
	};
};
