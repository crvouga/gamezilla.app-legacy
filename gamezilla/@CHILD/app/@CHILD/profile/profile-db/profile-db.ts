import { Result } from "gamezilla/@SHARED/core";
import { Profile, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ProfileDb = {
  findOneByUserId: (userId: UserId) => Promise<Result<string, Profile[]>>;
  insertOne: (profile: Profile) => Promise<Result<string, null>>;
};
