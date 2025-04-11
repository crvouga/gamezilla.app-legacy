import type { LanguageCodeISO_639_1, TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { PhoneNumber } from '~/@/phone-number'
import type { Task } from '~/@/promise/task'

export type VerifyCodeProblem =
  | {
      t: 'code-incorrect'
    }
  | {
      t: 'verification-expired'
    }
  | {
      t: 'verification-expired-too-many-failed-attempts'
    }
  | {
      t: 'verification-expired-not-latest-verification'
    }
  | {
      t: 'verification-not-found'
    }
  | {
      t: 'verification-already-verified'
    }
  | {
      t: 'database-error'
      error: string
    }

export const verifyCodeProblemToString = ({
  problem,
  t,
}: {
  problem: VerifyCodeProblem
  t: Translator
}): TranslatedText => {
  switch (problem.t) {
    case 'code-incorrect':
      return t('verify-sms-problem.code-incorrect')
    case 'verification-expired':
      return t('verify-sms-problem.verification-expired')
    case 'verification-not-found':
      return t('verify-sms-problem.verification-not-found')
    case 'verification-already-verified':
      return t('verify-sms-problem.verification-already-verified')
    case 'database-error':
      return t('verify-sms-problem.database-error')
    case 'verification-expired-too-many-failed-attempts':
      return t('verify-sms-problem.verification-expired-too-many-failed-attempts')
    case 'verification-expired-not-latest-verification':
      return t('verify-sms-problem.verification-expired-not-latest-verification')
  }
}

export type SendCodeProblem =
  | {
      t: 'database-error'
      error: string
    }
  | {
      t: 'hourly-limit-reached'
    }
  | {
      t: 'daily-limit-reached'
    }
  | {
      t: 'limit-reached'
    }

export const sendCodeProblemToString = ({
  problem,
  t,
}: {
  problem: SendCodeProblem
  t: Translator
}): TranslatedText => {
  switch (problem.t) {
    case 'database-error':
      return t('verify-sms-problem.database-error')
    case 'hourly-limit-reached':
      return t('verify-sms-problem.send-code-hourly-limit-reached')
    case 'daily-limit-reached':
      return t('verify-sms-problem.send-code-daily-limit-reached')
    case 'limit-reached':
      return t('verify-sms-problem.send-code-limit-reached')
  }
}

export type IVerifySMS = {
  sendCode: (input: {
    phoneNumber: PhoneNumber
    preferredLanguage: LanguageCodeISO_639_1
  }) => Task<SendCodeProblem, null>
  verifyCode: (input: { phoneNumber: PhoneNumber; code: string }) => Task<VerifyCodeProblem, null>
}

export type SendCodeOutput = Awaited<ReturnType<IVerifySMS['sendCode']>>

export type VerifyCodeOutput = Awaited<ReturnType<IVerifySMS['verifyCode']>>
