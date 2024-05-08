import type { PhoneNumber, Task } from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";

export type IAccountDb = {
	findOneByPhoneNumber: (input: {
		phoneNumber: PhoneNumber;
	}) => Task<string, UserAccount | null>;
	findOneByUserId: (input: {
		userId: UserId | null;
	}) => Task<string, UserAccount | null>;
	insert: (input: {
		account: UserAccount;
		phoneNumber?: PhoneNumber;
	}) => Task<string, null>;
};
