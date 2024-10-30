import { Ok, isErr } from 'gamezilla-app/@/core'
import { Profile } from 'gamezilla-app/app/@/data'
import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import type { IProfileCache } from './interface'

export const ProfileCacheDbKv = ({ dbConnKv }: { dbConnKv: IDbConnKv }): IProfileCache => {
  const profilesKv = DbConnKv.withNamespace({
    dbConnKv,
    namespace: ['spaces', 'profile-cache'],
    parser: Profile
  })
  return {
    async add(profiles) {
      return profilesKv.setMany(Object.entries(profiles))
    },
    async get(userIds) {
      const got = await profilesKv.getMany(userIds)

      if (isErr(got)) {
        return got
      }

      const profiles = Profile.indexByUserId(got.value)

      return Ok(profiles)
    }
  }
}
