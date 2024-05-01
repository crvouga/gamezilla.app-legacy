import type { Result } from "gamezilla-app/@/core";
import type { Hash } from "gamezilla-app/@/hashing";
import type { UserId } from "gamezilla-app/app/@/data";
import type { UserAccount } from "gamezilla-app/app/@/data/account";

export type IAccountDb = {
	findOneByPhoneNumberHash: (input: {
		phoneNumberHash: Hash;
	}) => Promise<Result<string, UserAccount | null>>;
	findOneByUserId: (input: {
		userId: UserId | null;
	}) => Promise<Result<string, UserAccount | null>>;
	insert: (input: {
		account: UserAccount;
		phoneNumberHash?: Hash;
	}) => Promise<Result<string, null>>;
};
