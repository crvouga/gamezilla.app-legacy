import type { Result } from "gamezilla-app/@shared/core";
import type { Hash } from "gamezilla-app/@shared/hashing";
import type { UserId } from "gamezilla-app/app/@shared/data";
import type { UserAccount } from "gamezilla-app/app/@shared/data/account";

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
