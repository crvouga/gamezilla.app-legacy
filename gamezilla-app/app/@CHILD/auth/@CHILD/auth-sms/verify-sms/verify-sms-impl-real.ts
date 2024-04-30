import { IDbConnKv } from "gamezilla-app/app/@SHARED/server/db-conn-kv"
import { ILogger } from "gamezilla-app/app/@SHARED/server/logger/logger"
import { ISMS } from "gamezilla-app/app/@SHARED/server/sms"
import {
  Err,
  Ok,
  PhoneNumber,
  Posix,
  TimeSpan,
  isErr,
} from "gamezilla-app/@SHARED/core"
import { IHashing } from "gamezilla-app/@SHARED/hashing"
import { Translator } from "gamezilla-app/@SHARED/l18n/generated"
import { ICodeGenerator } from "./code-generator"
import {
  Verification,
  VerificationAttempt,
  VerificationId,
} from "./verification"
import { IVerificationAttemptDb, IVerificationDb } from "./verification-db"
import { VerificationAttemptId } from "./verification/verification-attempt-id"
import { IVerifySMS } from "./verify-sms"

export const EXPIRES_IN = TimeSpan.fromMinutes(5)

export type VerifySMSDeps = {
  logger: ILogger
  sms: ISMS
  dbConnKv: IDbConnKv
  codeGenerator: ICodeGenerator
  verificationDb: IVerificationDb
  verificationAttemptDb: IVerificationAttemptDb
  translator: Translator
  hashing: IHashing
}

export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
  return {
    async sendCode(input) {
      const code = deps.codeGenerator.generate()

      const codeHash = await deps.hashing.hash({
        algo: {
          t: "sha256",
        },
        password: code,
      })

      const phoneNumberHash = await deps.hashing.hash({
        algo: {
          t: "bcrypt",
          cost: 10,
        },
        password: PhoneNumber.toString(input.phoneNumber),
      })

      const verificationNew: Verification = {
        codeHash: codeHash,
        phoneNumberHash: phoneNumberHash,
        createdAt: Posix.now(),
        expiresIn: EXPIRES_IN,
        verificationId: VerificationId.generate(),
        verifiedAt: null,
      }

      const upserted = await deps.verificationDb.upsert(verificationNew)

      if (isErr(upserted)) {
        return upserted
      }

      const sent = await deps.sms.sendMessage({
        message: deps.translator("verify-sms.code-message", code),
        phoneNumber: input.phoneNumber,
      })

      if (isErr(sent)) {
        return sent
      }

      return Ok({
        verificationId: verificationNew.verificationId,
      })
    },
    async verifyCode(input) {
      const found = await deps.verificationDb.findById({
        verificationId: input.verificationId,
      })

      if (isErr(found)) {
        return Err({
          t: "database-error",
          error: found.error,
        })
      }

      const verification = found.value

      if (!verification) {
        return Err({
          t: "verification-not-found",
        })
      }

      const foundAttempts = await deps.verificationAttemptDb.find({
        where: {
          equalsVerificationId: input.verificationId,
        },
      })

      if (isErr(foundAttempts)) {
        return Err({
          t: "database-error",
          error: foundAttempts.error,
        })
      }

      const attempts = foundAttempts.value

      if (attempts.length >= 3) {
        return Err({
          t: "verification-expired-too-many-failed-attempts",
        })
      }

      const inputtedCodeHash = await deps.hashing.hash({
        algo: {
          t: "sha256",
        },
        password: input.code,
      })

      const newAttempt: VerificationAttempt = {
        verificationAttemptId: VerificationAttemptId.generate(),
        codeHash: inputtedCodeHash,
        createdAt: Posix.now(),
        verificationId: input.verificationId,
      }

      await deps.verificationAttemptDb.upsert(newAttempt)

      const isCorrect = await deps.hashing.check({
        hash: verification.codeHash,
        password: input.code,
      })

      if (!isCorrect) {
        return Err({
          t: "code-incorrect",
        })
      }

      return Ok({
        phoneNumberHash: verification.phoneNumberHash,
      })
    },
  }
}
