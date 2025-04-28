import type { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'
import { ProfileDbQuery } from './query'

export type IProfileDb = {
  findByUserId: (userId: UserId) => Promise<Result<string, Profile[]>>
  query: (query: ProfileDbQuery) => Promise<Result<string, Paginated<Profile>>>
  sub: (query: ProfileDbQuery) => Sub<Profile[]>
  put: (profile: Profile) => Promise<Result<string, null>>
}
