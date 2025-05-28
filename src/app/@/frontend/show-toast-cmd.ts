import { TranslatedText } from '~/@/l18n'
import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'

export const parser = p.or(
  p.obj({
    t: p.l('enqueue'),
    text: p.custom((input): input is TranslatedText => typeof input === 'string', 'invalid text'),
    toastVariant: p.maybe(p.or(p.l('error'), p.l('info'))),
    duration: p.maybe(TimeSpan.parser),
    errorMsg: p.maybe(p.str),
  }),
)

export type ShowToastCmd = p.Infer<typeof parser>

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
  return isOk(parser.parse(cmd))
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
