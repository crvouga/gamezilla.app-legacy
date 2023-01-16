export * as Route from "./route"
import { UserId, Username } from "@gamezilla/data"

export type Ctx = {
    profiles: {
        [userId: UserId]: {
            userId: UserId,
            username: Username,
            avatarUrl: string
        }
    },
    currentUserId: UserId
}

