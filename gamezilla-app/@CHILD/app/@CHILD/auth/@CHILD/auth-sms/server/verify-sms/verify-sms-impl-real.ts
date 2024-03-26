import { SMS } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import {
  Err,
  PhoneNumber,
  Posix,
  TimeSpan,
  isErr,
} from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { ICodeGenerator } from "./code-generator"
import { IVerifySMS } from "./verify-sms"

export const EXPIRES_IN = TimeSpan.fromMinutes(5)

export const Verification = p.obj({
  code: p.str,
  phoneNumber: p.str,
  attempts: p.num,
  createdAt: Posix,
})

export const VerifySMS = (deps: {
  logger: Logger
  sms: SMS
  dbConnKv: IDbConnKv
  codeGenerator: ICodeGenerator
}): IVerifySMS => {
  const verificationsByPhoneNumber = IDbConnKv.instance(
    deps.dbConnKv,
    ["auth", "sms", "verifications-by-phone-number"],
    p.arr(Verification),
  )
  return {
    async sendCode(input) {
      const got = await verificationsByPhoneNumber.get(
        PhoneNumber.toString(input.phoneNumber),
      )

      if (isErr(got)) {
        deps.logger.error(
          `[verify-sms] [real] failed to get verification by phone number. ${got.error}`,
        )
        return Err(`Failed to get verification by phone number.`)
      }

      return Err("not implemented")
    },
    async verifyCode(_input) {
      verificationsByPhoneNumber
      return Err("not implemented")
    },
  }
}
