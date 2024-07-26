import {Ok, PhoneNumber} from 'gamezilla-app/@/core';
import type {ISMS} from './sms';
import type {ILogger} from '../logger';

export const SMSFake = ({
	logger,
}: {
	logger: ILogger;
}): ISMS & {
	sent: {phoneNumber: PhoneNumber; message: string}[];
} => {
	const sent: {
		phoneNumber: PhoneNumber;
		message: string;
	}[] = [];
	return {
		sent,
		async sendMessage(input) {
			sent.push({
				phoneNumber: input.phoneNumber,
				message: input.message,
			});
			const phoneNumber =
				PhoneNumber.toString(
					input.phoneNumber,
				);
			logger.info(
				`Sent SMS phoneNumber="${phoneNumber}" message="${input.message}"`,
			);
			return Ok(null);
		},
	};
};
