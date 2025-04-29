import type { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { UserProfile } from '~/app/@/data/user-profile'
import type { UserId } from '~/app/@/data/user-id'
import { ProfileDbQuery } from './query'

export type IProfileDb = {
  findByUserIds: (userIds: UserId[]) => Promise<Result<string, UserProfile[]>>
  query: (query: ProfileDbQuery) => Promise<Result<string, Paginated<UserProfile>>>
  sub: (query: ProfileDbQuery) => Sub<UserProfile[]>
  put: (profile: UserProfile) => Promise<Result<string, null>>
}
