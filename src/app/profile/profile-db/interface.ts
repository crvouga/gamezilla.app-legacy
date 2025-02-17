import type { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { ProfileCore } from '../types'

export type IProfileDb = {
  findByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
  put: (profile: ProfileCore) => Promise<Result<string, null>>
}
