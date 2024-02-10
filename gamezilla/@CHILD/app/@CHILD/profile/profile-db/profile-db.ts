import { Result } from "gamezilla/@SHARED/core"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ProfileCore } from "../profile.core"

export type ProfileDb = {
    findOneByUserId: (userId: UserId) => Promise<Result<string, ProfileCore[]>>
    insertOne: (profile: ProfileCore) => Promise<Result<string, null>>
}
