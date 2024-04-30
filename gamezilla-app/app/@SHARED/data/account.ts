import { Posix } from "gamezilla-app/@SHARED/core"
import { UserId } from "./user-id"

export type UserAccount = {
  userId: UserId
  createdAt: Posix
  role: "guest" | "normal" | "super"
}
