import {Err, PhoneNumber} from 'gamezilla-app/@/core';
import type {ILogger} from '../logger/logger';
import type {ISMS} from './sms';

export const SMSTwilio = ({logger}: {logger: ILogger}): ISMS => {
	return {
		async sendMessage(input) {
			try {
				const phoneNumber =
					PhoneNumber.toString(
						input.phoneNumber,
					);
				logger.info(
					`Sending SMS phoneNumber=${phoneNumber} message=${input.message}`,
				);
				return Err(
					'Not implemented',
				);
			} catch (error) {
				logger.error(
					`Errored while sending SMS: ${error}`,
				);
				return Err(
					String(
						error,
					),
				);
			}
		},
	};
};
