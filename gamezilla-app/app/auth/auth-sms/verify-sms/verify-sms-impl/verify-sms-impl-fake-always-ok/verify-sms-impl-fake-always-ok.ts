import {Ok} from 'gamezilla-app/@/core';
import type {IVerifySMS} from '../../verify-sms';

export const VerifySMS = (): IVerifySMS => {
	return {
		async sendCode() {
			return Ok(null);
		},
		async verifyCode() {
			return Ok(null);
		},
	};
};
