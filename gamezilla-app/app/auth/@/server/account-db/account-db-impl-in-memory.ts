import { Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import type { IAccountDb } from "./account-db";

export const AccountDbInMemory = (deps: {
	delay: () => Promise<void>;
}): IAccountDb => {
	const accounts = new Map<UserId, UserAccount>();
	return {
		async findOneByUserId(input) {
			await deps.delay();
			return Ok(input.userId ? accounts.get(input.userId) ?? null : null);
		},

		async findOneByPhoneNumber(input) {
			await deps.delay();
			for (const account of accounts.values()) {
				if (
					account.phoneNumber &&
					PhoneNumber.toString(account.phoneNumber) ===
						PhoneNumber.toString(input.phoneNumber)
				) {
					return Ok(account);
				}
			}

			return Ok(null);
		},

		async insert(input) {
			await deps.delay();
			accounts.set(input.account.userId, input.account);
			return Ok(null);
		},
	};
};
