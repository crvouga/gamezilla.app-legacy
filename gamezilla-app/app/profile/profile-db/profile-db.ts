import type {Result} from 'gamezilla-app/@/core';
import type {UserId} from 'gamezilla-app/app/@/data';
import type {ProfileCore} from '../profile.types';

export type ProfileDb = {
	findOneByUserId: (
		userId: UserId,
	) => Promise<Result<string, ProfileCore[]>>;
	insertOne: (
		profile: ProfileCore,
	) => Promise<Result<string, null>>;
};
