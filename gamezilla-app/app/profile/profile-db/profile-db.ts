import { Result } from "gamezilla-app/@shared/core"
import { UserId } from "gamezilla-app/app/@shared/data"
import { ProfileCore } from "../profile.core"

export type ProfileDb = {
  findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
  insertOne: (profile: ProfileCore) => Promise<Result<string, null>>
}
