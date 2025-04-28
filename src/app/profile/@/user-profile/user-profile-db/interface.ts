import type { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import type { UserId } from '~/app/@/data/user-id'
import { ProfileCore } from '../user-profile-core'
import { ProfileDbQuery } from './query'

export type IProfileDb = {
  findByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
  query: (query: ProfileDbQuery) => Promise<Result<string, Paginated<ProfileCore>>>
  sub: (query: ProfileDbQuery) => Sub<ProfileCore[]>
  put: (profile: ProfileCore) => Promise<Result<string, null>>
}
