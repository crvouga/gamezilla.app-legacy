import { Ok } from "gamezilla-app/@SHARED/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"
import { VerificationAttemptDb, VerificationDb } from "./verification-db"

export const VerficationDbHashMap = (): VerificationDb => {
  const verificationsById = new Map<VerificationId, Verification>()
  return {
    async find(input) {
      const found = verificationsById.get(input.where.equalsVerificationId)
      return Ok(found ? [found] : [])
    },
    async insert(verification) {
      verificationsById.set(verification.verificationId, verification)
      return Ok(null)
    },
  }
}

export const VerficationAttemptsDbHashMap = (): VerificationAttemptDb => {
  const attempsById = new Map<VerificationId, VerificationAttempt[]>()
  return {
    async insert(attempt) {
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
