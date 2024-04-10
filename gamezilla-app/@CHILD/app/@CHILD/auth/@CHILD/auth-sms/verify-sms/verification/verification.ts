import { Posix, TimeSpan } from "gamezilla-app/@SHARED/core"
import { Hash } from "gamezilla-app/@SHARED/hashing"
import { VerificationId } from "./verification-id"

export type Verification = {
  verificationId: VerificationId
  codeHash: Hash
  phoneNumberHash: Hash
  createdAt: Posix
  expiresIn: TimeSpan
  verifiedAt: Posix | null
}

export type VerificationAttempt = {
  verificationId: VerificationId
  codeHash: Hash
  createdAt: Posix
}
