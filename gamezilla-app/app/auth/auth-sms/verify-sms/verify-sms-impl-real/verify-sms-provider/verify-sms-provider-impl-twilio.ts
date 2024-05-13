import { Err } from "gamezilla-app/@/core";
import twilio from "twilio";
import { IVerifySMSProvider } from "./verify-sms-provider";

const accountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8";
const authToken = "70a3da99b8052fd3b4fbef13af0cb987";
export const serviceId = "VAe4a5dc015a0c79ed89a84074e8f3f7f5";
export const client = twilio(accountSid, authToken);

export type Deps = {};

export const VerifySMSProvider = (): IVerifySMSProvider => {
	return {
		async sendCode(_input) {
			return Err({
				t: "database-error",
				error: "Not implemented",
			});
			// try {
			// 	await client.verify.v2.services(serviceId).verifications.create({
			// 		channel: "sms",
			// 		to: PhoneNumber.toString(input.phoneNumber),
			// 	});

			// 	return Ok(null);
			// } catch (error) {
			// 	return Err(String(error));
			// }
		},

		async verifyCode(_input) {
			return Err({
				t: "database-error",
				error: "Not implemented",
			});
			// try {
			// 	const checked = await client.verify.v2
			// 		.services(serviceId)
			// 		.verificationChecks.create({
			// 			to: PhoneNumber.toString(input.phoneNumber),
			// 			code: input.code,
			// 		});

			// 	if (checked.valid) {
			// 		return Ok(input.phoneNumber);
			// 	}

			// 	return Err("Invalid code");
			// } catch (error) {
			// 	return Err(String(error));
			// }
		},
	};
};
