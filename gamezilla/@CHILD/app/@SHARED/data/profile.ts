import { UserId } from "./user-id"
import { Username } from "./username"

export type Profile = {
    userId: UserId
    avatarUrl: string
    username: Username
}
