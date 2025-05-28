import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import type { Screen } from '~/@/screen/generated/screens'

export const parser = p.or(
  p.obj({
    t: p.l('screen-evt.screen-changed'),
    screen: p.custom((input): input is Screen => typeof input === 'object', 'invalid screen'),
  }),
)

export type ScreenChangedEvt = p.Infer<typeof parser>

export const init = (screen: Screen): ScreenChangedEvt => {
  return {
    t: 'screen-evt.screen-changed',
    screen,
  }
}

const is = (evt: unknown): evt is ScreenChangedEvt => {
  return isOk(parser.parse(evt))
}

const did = (output?: { msgEvt?: unknown[] | null }, screen?: Screen): boolean => {
  return Boolean(
    output?.msgEvt?.some((evt) => {
      if (is(evt)) {
        return screen ? evt.screen === screen : true
      }
      return false
    }),
  )
}

export const ScreenChangedEvt = {
  is,
  init,
  did,
}
