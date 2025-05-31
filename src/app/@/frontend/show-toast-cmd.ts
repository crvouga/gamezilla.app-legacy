import { TranslatedText } from '~/@/l18n'
import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'

export const schema = s.or(
  s.obj({
    t: s.l('enqueue'),
    text: s.custom((input): input is TranslatedText => typeof input === 'string', 'invalid text'),
    toastVariant: s.maybe(s.or(s.l('error'), s.l('info'))),
    duration: s.maybe(TimeSpan.schema),
    errorMsg: s.maybe(s.str()),
  }),
)

export type ShowToastCmd = s.Infer<typeof schema>

export const init = (
  text: TranslatedText,
  config?: {
    variant?: 'error' | 'info'
    duration?: TimeSpan
    errorMsg?: string
  },
): ShowToastCmd => {
  return {
    t: 'enqueue',
    text,
    toastVariant: config?.variant,
    duration: config?.duration,
    errorMsg: config?.errorMsg,
  }
}

const is = (cmd: unknown): cmd is ShowToastCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, predicate?: (toast: { text: string }) => boolean): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return predicate ? predicate(cmd) : true
      }
      return false
    }),
  )
}

export const ShowToastCmd = {
  is,
  init,
  did,
}
