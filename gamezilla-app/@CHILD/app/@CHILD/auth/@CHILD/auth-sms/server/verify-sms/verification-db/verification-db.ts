import { Task } from "gamezilla-app/@SHARED/core"
import { Verification, VerificationAttempt } from "../verification"

export type VerificationDb = {
  findOneById(id: string): Task<string, Verification | null>
  insertOne(verification: Verification): Task<string, null>
}

export type VerificationAttemptDb = {
  findOneByVerificationId(
    verificationId: string,
  ): Task<string, VerificationAttempt | null>
  insertOne(attempt: VerificationAttempt): Task<string, null>
}
