import { ILogger } from '~/@/logger'
import { Ok } from '~/@/result'
import { Sub } from '~/@/sub'
import type { ProfileCore } from '../../../@/user-profile/user-profile-core'
import { UserProfileId } from '../user-profile-id'
import type { IProfileDb } from './interface'

export type Config = {
  t: 'hash-map'
  logger: ILogger
}

export const ProfileDb = (_config: Config): IProfileDb => {
  const profiles = new Map<UserProfileId, ProfileCore>()
  return {
    async findByUserId(userId) {
      const output: ProfileCore[] = Array.from(profiles.values()).filter((profile) => profile.userId === userId)

      return Ok(output)
    },
    async put(profile) {
      profiles.set(profile.id, profile)
      return Ok(null)
    },
    async query(query) {
      const hits = Array.from(profiles.values()).filter((profile) =>
        query.whereAnd?.userId?.equals ? query.whereAnd?.userId?.equals === profile.userId : true,
      )
      const ordered = hits.sort((a, b) => {
        if (query.order.createdAt === 'asc') {
          return a.createdAt - b.createdAt
        }
        return b.createdAt - a.createdAt
      })

      const items = ordered.slice(query.pagination.offset, query.pagination.offset + query.pagination.limit)

      return Ok({
        ...query.pagination,
        items,
        total: ordered.length,
      })
    },
    sub(_query) {
      return Sub.None
    },
  }
}
