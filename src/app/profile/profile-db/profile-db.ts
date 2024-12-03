import type { Result } from '@/core'
import type { UserId } from 'app/@/data'
import type { ProfileCore } from '../types'

export type ProfileDb = {
  findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
  insertOne: (profile: ProfileCore) => Promise<Result<string, null>>
}
