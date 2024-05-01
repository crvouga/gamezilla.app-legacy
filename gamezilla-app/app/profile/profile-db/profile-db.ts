import type { Result } from "gamezilla-app/@shared/core";
import type { UserId } from "gamezilla-app/app/@shared/data";
import type { ProfileCore } from "../profile.core";

export type ProfileDb = {
	findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>;
	insertOne: (profile: ProfileCore) => Promise<Result<string, null>>;
};
