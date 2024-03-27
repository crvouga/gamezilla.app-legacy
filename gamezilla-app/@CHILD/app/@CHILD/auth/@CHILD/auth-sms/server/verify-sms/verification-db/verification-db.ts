import { Task } from "gamezilla-app/@SHARED/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"

export type VerificationDb = {
  find(input: {
    where: { equalsVerificationId: VerificationId }
  }): Task<string, Verification[]>
  insert(verification: Verification): Task<string, null>
}

export type VerificationAttemptDb = {
  find(input: {
    where: { equalsVerificationId: VerificationId }
  }): Task<string, VerificationAttempt[]>
  insert(attempt: VerificationAttempt): Task<string, null>
}
