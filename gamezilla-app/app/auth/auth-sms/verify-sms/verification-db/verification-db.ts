import { Task } from "gamezilla-app/@shared/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"

export type IVerificationDb = {
  findById(input: {
    verificationId: VerificationId
  }): Task<string, Verification | null>
  upsert(verification: Verification): Task<string, null>
}

export type IVerificationAttemptDb = {
  find(input: {
    where: { equalsVerificationId: VerificationId }
  }): Task<string, VerificationAttempt[]>
  upsert(attempt: VerificationAttempt): Task<string, null>
}
