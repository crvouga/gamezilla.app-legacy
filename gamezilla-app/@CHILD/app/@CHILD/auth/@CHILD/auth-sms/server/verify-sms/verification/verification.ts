import { PhoneNumber, Posix, TimeSpan } from "gamezilla-app/@SHARED/core"
import { CodeHash } from "../code-hash"
import { VerificationId } from "./verification-id"

export type Verification = {
  verificationId: VerificationId
  codeHash: CodeHash
  phoneNumber: PhoneNumber
  createdAt: Posix
  expiresIn: TimeSpan
}

export type VerificationAttempt = {
  verificationId: VerificationId
  codeHash: CodeHash
  createdAt: Posix
}
