import type { Posix, TimeSpan } from 'gamezilla-app/@/core'
import type { IHashing } from 'gamezilla-app/@/hashing'
import type { LanguageCodeISO_639_1 } from 'gamezilla-app/@/l18n'
import type { Translator } from 'gamezilla-app/@/l18n/generated'
import type { ILogger } from 'gamezilla-app/app/@/server/logger'
import type { ISMS } from 'gamezilla-app/app/@/server/sms'
import type { IVerificationAttemptDb } from '../../verification-attempt'
import type { IVerificationCodeGenerator } from '../../verification-code-generator'
import type { IVerificationDb } from '../../verification/verification-db'

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
