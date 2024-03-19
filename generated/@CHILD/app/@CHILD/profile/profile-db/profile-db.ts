import { Result } from "gamezilla-app/@SHARED/core";
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { ProfileCore } from "../profile.core";
export type ProfileDb = {
    findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>;
    insertOne: (profile: ProfileCore) => Promise<Result<string, null>>;
};
