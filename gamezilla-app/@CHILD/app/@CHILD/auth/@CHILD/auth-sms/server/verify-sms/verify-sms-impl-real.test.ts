import { describe, expect, it } from "bun:test"
import { createDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { SMSFake } from "gamezilla-app/@CHILD/app/@SHARED/server/sms/sms-impl-fake"
import { PhoneNumber, isOk } from "gamezilla-app/@SHARED/core"
import { CodeGenerator } from "./code-generator"
import { VerifySMS } from "./verify-sms-impl-real"

const Fixture = async () => {
  const sms = SMSFake()

  const dbConnKv = await createDbConnKv({ t: "hash-map" })

  const CODE = "123456"

  const codeGenerator = CodeGenerator({ t: "fake", code: CODE })

  const logger = Logger({ t: "noop" })

  const verifySMS = VerifySMS({
    dbConnKv,
    logger,
    sms,
    codeGenerator,
  })

  const phoneNumber = PhoneNumber.unsafeParse("+15555555555")

  return {
    CODE,
    phoneNumber,
    dbConnKv,
    verifySMS,
    sms,
  }
}

describe(import.meta.file, () => {
  it.skip("should send verification code to phone number", async () => {
    const f = await Fixture()

    await f.verifySMS.sendCode({
      phoneNumber: f.phoneNumber,
    })

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
    })

    expect(isOk(verified)).toBe(true)
  })
})
