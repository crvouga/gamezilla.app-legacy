import { P as P } from "gamezilla-app/@SHARED/parsing"
import { UserId } from "./user-id"
import { Username } from "./username"

const is = P.obj({
  userId: UserId.is,
  avatarUrl: P.str,
  username: Username.is,
})

export type Profile = P.Infer<typeof is>

export const Profile = {
  is,
}
