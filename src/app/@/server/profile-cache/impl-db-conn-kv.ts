import { Ok, isErr } from '~/@/result'
import { Profile } from '~/app/@/data'
import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const ProfileCache = (config: Config): IProfileCache => {
  const profilesKv = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
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
