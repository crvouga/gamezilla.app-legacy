import { Profile, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { ok } from "gamezilla-app/@SHARED/core"
import { IProfileCache } from "./profile-cache"

export const ProfileCacheDbKv = ({
  dbConnKv,
}: {
  dbConnKv: DbConnKv
}): IProfileCache => {
  const profilesKv = DbConnKv.instance(
    dbConnKv,
    ["spaces", "profile-cache"],
    Profile.is,
  )
  return {
    async add(profiles) {
      await Promise.all(
        Object.entries(profiles).map(([userId, profile]) =>
          profilesKv.set(userId, profile),
        ),
      )
      return ok(null)
    },
    async get(userIds) {
      const profiles: { [userId: UserId]: Profile } = {}

      const all = await Promise.all(
        userIds.map((userId) => profilesKv.get(userId)),
      )

      for (const result of all) {
        if (result.t === "ok") {
          const profile = result.value
          if (profile) {
            profiles[profile.userId] = profile
          }
        }
      }

      return ok(profiles)
    },
  }
}
