import { unwrap } from '~/@/result'
import { Hashing, type IHashing } from '~/@/hashing'
import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Logger } from '~/@/logger'
import { SMSFake } from '~/@/sms/impl-fake'
import { Translator } from '~/app/@/frontend/translator'
import { VerificationAttemptDb } from '../verification-attempt'
import { type IVerificationCodeGenerator, VerificationCodeGenerator } from '../verification-code-generator'
import { type IVerificationDb, VerificationDb } from '../verification/verification-db'
import { VerifySMS } from '../impl'
import { Config } from '../shared'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { PhoneNumber } from '~/@/phone-number'

export const VerifySMSInHouseFixture = async (input?: {
  verifyCodeMaxAttempts?: number
  verifyCodeExpiresIn?: TimeSpan
  sendCodeHourlyLimit?: number
  sendCodeDailyLimit?: number
  codeGenerator?: IVerificationCodeGenerator
  now?: () => UnixMs
  hashing?: IHashing
  verificationDb?: IVerificationDb
}) => {
  const sms = SMSFake({ logger: Logger({ t: 'noop' }) })
  const CODE = '123456'
  const WRONG_CODE = '42'
  const verificationCodeGenerator =
    input?.codeGenerator ??
    VerificationCodeGenerator({
      t: 'fake',
      code: CODE,
    })
  const logger = Logger({ t: 'noop' })
  const verificationDb = input?.verificationDb ?? VerificationDb({ t: 'hash-map' })
  const verificationAttemptDb = VerificationAttemptDb({
    t: 'hash-map',
  })
  const hashing = input?.hashing ?? Hashing({ t: 'noop' })

  const config: Config = {
    t: 'in-house',
    logger,
    verificationDb,
    verificationAttemptDb,
    hashing,
    now: input?.now ?? UnixMs.now,
    sendCodeHourlyLimit: input?.sendCodeHourlyLimit ?? 10,
    sendCodeDailyLimit: input?.sendCodeDailyLimit ?? 10,
    verifyCodeExpiresIn: input?.verifyCodeExpiresIn ?? TimeSpan.minutes(5),
    verifyCodeMaxAttempts: input?.verifyCodeMaxAttempts ?? 3,
    sms,
    Translator,
    verificationCodeGenerator,
  }
  const verifySMS = VerifySMS(config)

  const phoneNumber = unwrap(PhoneNumber.fromString('+1 480-209-8698'))
  const preferredLanguage: LanguageCodeISO_639_1 = 'en'

  return {
    ...config,
    preferredLanguage,
    verificationDb,
    CODE,
    WRONG_CODE,
    phoneNumber,
    verifySMS,
    sms,
  }
}
