import { p } from "gamezilla-app/@SHARED/parser"
import { UserId } from "./user-id"
import { Username } from "./username"

export const Profile = p.obj({
  userId: p.custom(UserId.is, "Invalid user id"),
  avatarUrl: p.str,
  username: p.custom(Username.is, "Invalid username"),
})

export type Profile = p.Infer<typeof Profile>
