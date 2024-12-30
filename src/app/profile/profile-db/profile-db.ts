import type { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { ProfileCore } from '../types'

export type ProfileDb = {
  findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
  insertOne: (profile: ProfileCore) => Promise<Result<string, null>>
}
