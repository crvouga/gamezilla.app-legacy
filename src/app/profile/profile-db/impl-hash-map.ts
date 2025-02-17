import { Ok } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { ProfileCore } from '../types'
import type { IProfileDb } from './interface'
import { ILogger } from '~/@/logger'

export type Config = {
  t: 'hash-map'
  logger: ILogger
}

export const ProfileDb = (_config: Config): IProfileDb => {
  const profiles = new Map<UserId, ProfileCore>()
  return {
    async findByUserId(userId) {
      const output: ProfileCore[] = []

      const profile = profiles.get(userId) ?? null
      if (profile) {
        output.push(profile)
      }

      return Ok(output)
    },
    async put(profile) {
      profiles.set(profile.userId, profile)
      return Ok(null)
    },
  }
}
