import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { ProfileCache } from "./profile-cache"
import { Profile, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Result, ok } from "gamezilla-app/@SHARED/core"

export const ProfileCacheDbKv = ({
  dbConnKv,
}: {
  dbConnKv: DbConnKv
}): ProfileCache => {
  const profilesKv = DbConnKv.instance(
    dbConnKv,
    ["spaces", "profile-cache"],
    Profile.is,
  )
  return {
    async add(profiles) {
      for (const userId in profiles) {
        const profile = profiles[userId as UserId]
        if (!profile) {
          continue
        }
        await profilesKv.set(userId, profile)
      }
      return ok(null)
    },
    async get(userIds) {
      const profiles: { [userId: UserId]: Profile } = {}

      for (const userId of userIds) {
        const profile = Result.withDefault(await profilesKv.get(userId), null)
        if (profile) {
          profiles[userId] = profile
        }
      }

      return ok(profiles)
    },
  }
}
