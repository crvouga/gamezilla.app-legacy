import type { IHashing } from '~/@/hashing'
import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { ILogger } from '~/@/logger'
import type { ISMS } from '~/@/sms'
import type { IVerificationAttemptDb } from '../../in-house/verification-attempt'
import type { IVerificationCodeGenerator } from '../../in-house/verification-code-generator'
import type { IVerificationDb } from '../../in-house/verification/verification-db'
import { TimeSpan } from '~/@/time/time-span'
import { Posix } from '~/@/time/posix'

export type Config = {
  t: 'in-house'
  logger: ILogger
  sms: ISMS
  verificationCodeGenerator: IVerificationCodeGenerator
  verificationDb: IVerificationDb
  verificationAttemptDb: IVerificationAttemptDb
  Translator: (lang: LanguageCodeISO_639_1) => Translator
  hashing: IHashing
  now: () => Posix
  verifyCodeMaxAttempts: number
  verifyCodeExpiresIn: TimeSpan
  sendCodeHourlyLimit: number
  sendCodeDailyLimit: number
}
