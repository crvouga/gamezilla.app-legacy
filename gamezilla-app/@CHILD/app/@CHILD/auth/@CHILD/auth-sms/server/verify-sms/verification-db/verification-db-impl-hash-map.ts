import { Ok } from "gamezilla-app/@SHARED/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"
import { IVerificationAttemptDb, IVerificationDb } from "./verification-db"

export const VerficationDbHashMap = (): IVerificationDb => {
  const verificationsById = new Map<VerificationId, Verification>()
  return {
    async find(input) {
      const found = verificationsById.get(input.where.equalsVerificationId)
      return Ok(found ? [found] : [])
    },
    async upsert(verification) {
      verificationsById.set(verification.verificationId, verification)
      return Ok(null)
    },
  }
}

export const VerficationAttemptsDbHashMap = (): IVerificationAttemptDb => {
  const attempsById = new Map<VerificationId, VerificationAttempt[]>()
  return {
    async upsert(attempt) {
      const attempts = attempsById.get(attempt.verificationId) ?? []
      attempts.push(attempt)
      attempsById.set(attempt.verificationId, attempts)
      return Ok(null)
    },
    async find(input) {
      return Ok(attempsById.get(input.where.equalsVerificationId) ?? [])
    },
  }
}
