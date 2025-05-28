import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { p } from '~/@/schema'

const parser = p.or(
  p.obj({
    t: p.l('code-incorrect'),
  }),
  p.obj({
    t: p.l('verification-expired'),
  }),
  p.obj({
    t: p.l('verification-expired-too-many-failed-attempts'),
  }),
  p.obj({
    t: p.l('verification-expired-not-latest-verification'),
  }),
  p.obj({
    t: p.l('verification-not-found'),
  }),
  p.obj({
    t: p.l('verification-already-verified'),
  }),
  p.obj({
    t: p.l('database-error'),
    error: p.str,
  }),
)

export type VerifyCodeProblem = p.Infer<typeof parser>

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
  parser,
  toString,
}
