export * from "./supabase"
export * from "./data"
export * as Route from "./route"
import { UserId, Username } from "./data"

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

