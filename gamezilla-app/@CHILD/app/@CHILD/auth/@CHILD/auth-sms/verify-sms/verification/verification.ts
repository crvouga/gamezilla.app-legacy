import { Posix, TimeSpan } from "gamezilla-app/@SHARED/core"
import { Hash } from "gamezilla-app/@SHARED/hashing"
import { VerificationAttemptId } from "./verification-attempt-id"
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
  verificationAttemptId: VerificationAttemptId
  verificationId: VerificationId
  codeHash: Hash
  createdAt: Posix
}
