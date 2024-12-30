import { Err, Ok, isErr } from '~/@/core'
import type { IVerifySMS } from '../../interface'
import { VerificationId, type Verification } from '../../verification'
import { Config } from './shared'
import { TimeSpan } from '~/@/time/time-span'
import { Posix } from '~/@/time/posix'

export const SendCode =
  (deps: Config): IVerifySMS['sendCode'] =>
  async (input) => {
    const now = deps.now()

    const lastDayVerifications = await deps.verificationDb.find({
      where: {
        createdAtPosix: {
          '<=': now,
          '>=': Posix.past(now, TimeSpan.days(1))
        },
        phoneNumber: {
          '=': input.phoneNumber
        }
      },
      limit: 1000,
      offset: 0,
      order: {
        createdAt: 'desc'
      }
    })

    if (isErr(lastDayVerifications)) {
      return Err({
        t: 'database-error',
        error: lastDayVerifications.error
      })
    }

    if (lastDayVerifications.value.items.length >= deps.sendCodeDailyLimit) {
      return Err({
        t: 'daily-limit-reached'
      })
    }

    const lastHourVerifications = await deps.verificationDb.find({
      where: {
        createdAtPosix: {
          '<=': now,
          '>=': Posix.past(now, TimeSpan.hours(1))
        },
        phoneNumber: {
          '=': input.phoneNumber
        }
      },
      order: {
        createdAt: 'desc'
      },
      limit: 1000,
      offset: 0
    })

    if (isErr(lastHourVerifications)) {
      return Err({
        t: 'database-error',
        error: lastHourVerifications.error
      })
    }

    if (lastHourVerifications.value.items.length >= deps.sendCodeHourlyLimit) {
      return Err({
        t: 'hourly-limit-reached'
      })
    }

    const createdAt = deps.now()

    const code = deps.verificationCodeGenerator.generate()

    const verificationNew: Verification = {
      phoneNumber: input.phoneNumber,
      createdAtPosix: createdAt,
      expiresAtPosix: Posix.future(createdAt, deps.verifyCodeExpiresIn),
      verificationId: VerificationId.generate(),
      verifiedAtPosix: null,
      codeHash: await deps.hashing.hash({
        algo: {
          t: 'sha256'
        },
        password: code
      })
    }

    const upserted = await deps.verificationDb.put(verificationNew)

    if (isErr(upserted)) {
      return Err({
        t: 'database-error',
        error: upserted.error
      })
    }

    const put = await deps.verificationDb.put(verificationNew)

    if (isErr(put)) {
      return Err({
        t: 'database-error',
        error: put.error
      })
    }

    const sent = await deps.sms.sendMessage({
      message: deps.Translator(input.preferredLanguage)('verify-sms.code-message', code),
      phoneNumber: input.phoneNumber
    })

    if (isErr(sent)) {
      return Err({
        t: 'database-error',
        error: sent.error
      })
    }

    return Ok(null)
  }
