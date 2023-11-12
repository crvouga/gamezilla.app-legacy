import { ok } from "gamezilla/@SHARED/core";
import { Profile, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ProfileDb } from "./profile-db";

export const createProfileDb = (): ProfileDb => {
  const profiles = new Map<UserId, Profile>();
  return {
    findOneByUserId: async (userIds) => {
      const output: Profile[] = [];

      for (const userId of userIds) {
        const profile = profiles.get(userId) ?? null;
        if (profile) {
          output.push(profile);
        }
      }

      return ok(output);
    },
    insertOne: async (profile) => {
      profiles.set(profile.userId, profile);
      return ok(null);
    },
  };
};
