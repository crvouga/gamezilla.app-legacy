import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { UserProfile } from '../../data/user-profile'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
}

export const ProfileCache = (config: Config): IProfileCache => {
  const profilesKv = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['profile-cache', 'profiles'],
    schema: UserProfile,
  })
  return {
    async add(profiles) {
      return await profilesKv.setMany(profiles.map((p) => [p.id, p]))
    },
    async getByUserId(userIds) {
      return await profilesKv.getMany(userIds)
    },
  }
}
