import { Ok, type PhoneNumber } from "gamezilla-app/@/core";
import type { ISMS } from "./sms";

export const SMSFake = (): ISMS & {
	sent: { phoneNumber: PhoneNumber; message: string }[];
} => {
	const sent: { phoneNumber: PhoneNumber; message: string }[] = [];
	return {
		sent,
		async sendMessage(_input) {
			sent.push({
				phoneNumber: _input.phoneNumber,
				message: _input.message,
			});
			return Ok(null);
		},
	};
};
