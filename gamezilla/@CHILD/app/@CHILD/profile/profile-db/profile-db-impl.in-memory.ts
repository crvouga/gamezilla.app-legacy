import { ok } from "gamezilla/@SHARED/core";
import { Profile, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ProfileDb } from "./profile-db";

export const createProfileDb = (): ProfileDb => {
  const profiles = new Map<UserId, Profile>();
  return {
    findOneByUserId: async (userId) => {
      const output: Profile[] = [];

      const profile = profiles.get(userId) ?? null;
      if (profile) {
        output.push(profile);
      }

      return ok(output);
    },
    insertOne: async (profile) => {
      profiles.set(profile.userId, profile);
      return ok(null);
    },
  };
};
