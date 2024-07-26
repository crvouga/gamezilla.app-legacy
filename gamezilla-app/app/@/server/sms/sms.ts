import type {PhoneNumber, Result} from 'gamezilla-app/@/core';

export type ISMS = {
	sendMessage: (input: {
		phoneNumber: PhoneNumber;
		message: string;
	}) => Promise<Result<string, null>>;
};
