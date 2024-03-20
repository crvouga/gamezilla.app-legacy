import { p as p } from "gamezilla-app/@SHARED/parsing"
import { UserId } from "./user-id"
import { Username } from "./username"

const is = p.obj({
  userId: UserId.is,
  avatarUrl: p.str,
  username: Username.is,
})

export type Profile = p.Infer<typeof is>

export const Profile = {
  is,
}
