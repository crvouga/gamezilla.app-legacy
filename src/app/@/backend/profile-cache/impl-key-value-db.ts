import { Ok, isErr } from '~/@/result'
import { Profile } from '~/app/@/data/profile'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
}

export const ProfileCache = (config: Config): IProfileCache => {
  const profilesKv = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['spaces', 'profile-cache'],
    parser: Profile,
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
    },
  }
}
