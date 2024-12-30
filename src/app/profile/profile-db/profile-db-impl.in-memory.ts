import type { UserId } from '~/app/@/data'
import { Ok } from '~/@/result'
import type { ProfileCore } from '../types'
import type { ProfileDb } from './profile-db'

export const createProfileDb = (): ProfileDb => {
  const profiles = new Map<UserId, ProfileCore>()
  return {
    findOneByUserId: async (userId) => {
      const output: ProfileCore[] = []

      const profile = profiles.get(userId) ?? null
      if (profile) {
        output.push(profile)
      }

      return Ok(output)
    },
    insertOne: async (profile) => {
      profiles.set(profile.userId, profile)
      return Ok(null)
    }
  }
}
