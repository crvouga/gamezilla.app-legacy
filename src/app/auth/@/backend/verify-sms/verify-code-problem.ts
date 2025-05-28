import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'

const schema = s.or(
  s.obj({
    t: s.l('code-incorrect'),
  }),
  s.obj({
    t: s.l('verification-expired'),
  }),
  s.obj({
    t: s.l('verification-expired-too-many-failed-attempts'),
  }),
  s.obj({
    t: s.l('verification-expired-not-latest-verification'),
  }),
  s.obj({
    t: s.l('verification-not-found'),
  }),
  s.obj({
    t: s.l('verification-already-verified'),
  }),
  s.obj({
    t: s.l('database-error'),
    error: s.str,
  }),
)

export type VerifyCodeProblem = s.Infer<typeof schema>

const toString = ({ problem, t }: { problem: VerifyCodeProblem; t: Translator }): TranslatedText => {
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

export const VerifyCodeProblem = {
  schema,
  toString,
}
