import { P } from "gamezilla-app/@SHARED/parsing"
import { UserId } from "./user-id"
import { Username } from "./username"

export type Profile = {
  userId: UserId
  avatarUrl: string
  username: Username
}

const to = (x: unknown): Profile | null => {
  if (
    P.obj(x) &&
    P.has(x, "userId", UserId.is) &&
    P.has(x, "avatarUrl", P.str) &&
    P.has(x, "username", Username.is)
  ) {
    return x
  }
  return null
}

const is = P.is(to)

export const Profile = {
  is,
  to,
}
