import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Ok } from "gamezilla-app/@SHARED/core"
import { ProfileCore } from "../profile.core"
import { ProfileDb } from "./profile-db"

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
    },
  }
}
