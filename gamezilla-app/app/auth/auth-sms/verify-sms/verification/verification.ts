import { Posix, TimeSpan } from "gamezilla-app/@shared/core"
import { Hash } from "gamezilla-app/@shared/hashing"
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
