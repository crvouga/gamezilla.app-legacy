import { ILogger } from '~/@/logger'
import { Ok } from '~/@/result'
import { Sub } from '~/@/sub'

import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import type { IUserProfileDb } from './interface'

export type Config = {
  t: 'hash-map'
  logger: ILogger
}

export const ProfileDb = (_config: Config): IUserProfileDb => {
  const profiles = new Map<UserId, UserProfile>()
  return {
    async findByUserIds(userIds) {
      const output: UserProfile[] = Array.from(profiles.values()).filter((profile) => userIds.includes(profile.userId))

      return Ok(output)
    },
    async put(profile) {
      profiles.set(profile.userId, profile)
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
      return Sub.none()
    },
  }
}
