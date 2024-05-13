import Vonage from "@vonage/server-sdk";
import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { ILogger } from "../logger/logger";
import type { ISMS } from "./sms";

export const SMSVonage = ({ logger }: { logger: ILogger }): ISMS => {
	// @ts-expect-error
	const vonage = new Vonage.Vonage({
		apiKey: "22d06daf",

		apiSecret: "RBsNzrkEjHJh9IWt",
	});
	const from = "15137788008";
	return {
		async sendMessage(input) {
			try {
				const to = PhoneNumber.toString(input.phoneNumber);
				const text = input.message;
				logger.info(`Sending SMS phoneNumber=${to} message=${input.message}`);

				await vonage.sms.send({
					to,
					from,
					text,
				});

				return Ok(null);
			} catch (error) {
				logger.error(`Errored while sending SMS: ${error}`);
				return Err(String(error));
			}
		},
	};
};
