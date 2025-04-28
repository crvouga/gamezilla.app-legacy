import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { p } from '~/@/parser'
import { Ok, isErr, unwrapOr } from '~/@/result'
import { Profile } from '~/app/@/data/profile'
import { UserProfileId } from '~/app/profile/@/user-profile/user-profile-id'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
}

export const ProfileCache = (config: Config): IProfileCache => {
  const profilesKv = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['profile-cache', 'profiles'],
    parser: Profile,
  })
  const indexByUserIdKv = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['profile-cache', 'index-by-user-id'],
    parser: p.arr(UserProfileId),
  })
  return {
    async add(profiles) {
      for (const profile of profiles) {
        await profilesKv.set(profile.id, profile)
        const userProfileIds = unwrapOr(await indexByUserIdKv.get(profile.userId), []) ?? []
        const userProfileIdsNew = Array.from(new Set([...userProfileIds, profile.id]))
        await indexByUserIdKv.set(profile.userId, userProfileIdsNew)
      }
      return Ok(null)
    },
    async getByUserId(userIds) {
      const got = await indexByUserIdKv.getMany(userIds)

      if (isErr(got)) return got

      const profiles = await profilesKv.getMany(got.value.flat())

      return profiles
    },
  }
}
