import { Ok } from "gamezilla-app/@shared/core"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "../verification"
import { IVerificationAttemptDb, IVerificationDb } from "./verification-db"

export const VerficationDbHashMap = (): IVerificationDb => {
  const verificationsById = new Map<VerificationId, Verification>()
  return {
    async findById(input) {
      const found = verificationsById.get(input.verificationId) ?? null
      return Ok(found)
    },
    async upsert(verification) {
      verificationsById.set(verification.verificationId, verification)
      return Ok(null)
    },
  }
}

export const VerficationAttemptDbHashMap = (): IVerificationAttemptDb => {
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
