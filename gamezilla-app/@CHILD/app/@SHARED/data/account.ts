import { EmailAddress, PhoneNumber, Posix } from "gamezilla-app/@SHARED/core"
import { UserId } from "./user-id"

export type Account = {
  userId: UserId
  createdAt: Posix
  role: "guest" | "normal" | "super"
  phoneNumber?: PhoneNumber | null | undefined
  emailAddress?: EmailAddress | null | undefined
}
