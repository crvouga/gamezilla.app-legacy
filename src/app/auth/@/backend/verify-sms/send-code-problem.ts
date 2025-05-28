import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { p } from '~/@/schema'

const parser = p.or(
  p.obj({
    t: p.l('database-error'),
    error: p.str,
  }),
  p.obj({
    t: p.l('hourly-limit-reached'),
  }),
  p.obj({
    t: p.l('daily-limit-reached'),
  }),
  p.obj({
    t: p.l('limit-reached'),
  }),
)

export type SendCodeProblem = p.Infer<typeof parser>

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
