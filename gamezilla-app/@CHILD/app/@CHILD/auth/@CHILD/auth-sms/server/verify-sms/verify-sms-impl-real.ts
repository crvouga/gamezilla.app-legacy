import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { ISMS } from "gamezilla-app/@CHILD/app/@SHARED/server/sms"
import { Ok, Posix, TimeSpan, isErr } from "gamezilla-app/@SHARED/core"
import { Translator } from "gamezilla-app/@SHARED/l18n/generated"
import { ICodeGenerator } from "./code-generator"
import { CodeHash } from "./code-hash"
import { Verification, VerificationId } from "./verification"
import { IVerificationAttemptDb, IVerificationDb } from "./verification-db"
import { IVerifySMS } from "./verify-sms"

export const EXPIRES_IN = TimeSpan.fromMinutes(5)

export type VerifySMSDeps = {
  logger: Logger
  sms: ISMS
  dbConnKv: IDbConnKv
  codeGenerator: ICodeGenerator
  verificationDb: IVerificationDb
  verificationAttemptDb: IVerificationAttemptDb
  translator: Translator
}

export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
  return {
    async sendCode(input) {
      const code = deps.codeGenerator.generate()

      const codeHash = CodeHash.hash(code)

      const verificationNew: Verification = {
        codeHash: codeHash,
        phoneNumber: input.phoneNumber,
        createdAt: Posix.now(),
        expiresIn: EXPIRES_IN,
        verificationId: VerificationId.generate(),
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

      return Ok(null)
    },
    async verifyCode(_input) {
      return Ok(null)
    },
  }
}
