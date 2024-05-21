import { Err, Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";
import type { IUserAccountDb } from "./user-account-db";

export const UserAccountDbInMemory = (deps: {
	delay: () => Promise<void>;
}): IUserAccountDb => {
	const accounts = new Map<UserId, UserAccount>();
	return {
		async findOneByUserId(input) {
			await deps.delay();
			return Ok(input.userId ? accounts.get(input.userId) ?? null : null);
		},

		async findOneByPhoneNumber(input) {
			await deps.delay();
			for (const account of accounts.values()) {
				if (!account.phoneNumber) continue;

				const match =
					PhoneNumber.toString(account.phoneNumber) ===
					PhoneNumber.toString(input.phoneNumber);

				if (!match) {
					continue;
				}

				return Ok(account);
			}

			return Ok(null);
		},

		async insert(input) {
			await deps.delay();
			const existing = accounts.get(input.account.userId);
			if (existing) {
				return Err("Can not insert account that already exists.");
			}
			accounts.set(input.account.userId, input.account);
			return Ok(null);
		},
	};
};
