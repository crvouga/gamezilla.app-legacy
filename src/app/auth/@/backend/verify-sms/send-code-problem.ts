import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'

const parser = s.or(
  s.obj({
    t: s.l('database-error'),
    error: s.str,
  }),
  s.obj({
    t: s.l('hourly-limit-reached'),
  }),
  s.obj({
    t: s.l('daily-limit-reached'),
  }),
  s.obj({
    t: s.l('limit-reached'),
  }),
)

export type SendCodeProblem = s.Infer<typeof parser>

const toString = ({ problem, t }: { problem: SendCodeProblem; t: Translator }): TranslatedText => {
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

export const SendCodeProblem = {
  parser,
  toString,
}
