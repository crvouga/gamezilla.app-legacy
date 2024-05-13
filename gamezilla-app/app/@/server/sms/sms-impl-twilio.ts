import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import twilio from "twilio";
import type { ILogger } from "../logger/logger";
import type { ISMS } from "./sms";

const accountSid = "ACd7936c09aaa6aeb6e89a8a2374f0dbc8";
const authToken = "70a3da99b8052fd3b4fbef13af0cb987";
const messagingServiceSid = "MGfd1eb2398c703b2d37b1b12f6e1beb1d";

export const SMSTwilio = ({ logger }: { logger: ILogger }): ISMS => {
	const client = twilio(accountSid, authToken);
	return {
		async sendMessage(input) {
			try {
				const phoneNumber = PhoneNumber.toString(input.phoneNumber);
				logger.info(
					`Sending SMS phoneNumber=${phoneNumber} message=${input.message}`,
				);
				const created = await client.messages.create({
					messagingServiceSid,
					to: phoneNumber,
					body: input.message,
				});
				logger.info(`SMS sent. sid=${created.sid}`);
				return Ok(null);
			} catch (error) {
				logger.error(`Errored while sending SMS: ${error}`);
				return Err(String(error));
			}
		},
	};
};
