import { Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { ISMS } from "./sms";
import { ILogger } from "../logger";

export const SMSFake = ({
	logger,
}: { logger: ILogger }): ISMS & {
	sent: { phoneNumber: PhoneNumber; message: string }[];
} => {
	const sent: { phoneNumber: PhoneNumber; message: string }[] = [];
	return {
		sent,
		async sendMessage(input) {
			sent.push({
				phoneNumber: input.phoneNumber,
				message: input.message,
			});
			logger.info(
				`Sent SMS phoneNumber=${PhoneNumber.format(
					input?.phoneNumber,
				)} message=${input?.message}`,
			);
			return Ok(null);
		},
	};
};
