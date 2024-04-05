import { Task } from "gamezilla-app/@SHARED/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"

export type IVerificationDb = {
  find(input: {
    where: { equalsVerificationId: VerificationId }
  }): Task<string, Verification[]>
  upsert(verification: Verification): Task<string, null>
}

export type IVerificationAttemptDb = {
  find(input: {
    where: { equalsVerificationId: VerificationId }
  }): Task<string, VerificationAttempt[]>
  upsert(attempt: VerificationAttempt): Task<string, null>
}
