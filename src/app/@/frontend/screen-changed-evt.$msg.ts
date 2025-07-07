import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import type { Screen } from '~/@/screens/generated/screens'

export const schema = s.or(
  s.obj({
    t: s.l('screen-evt.screen-changed'),
    screen: s.custom((input): input is Screen => typeof input === 'object', 'invalid screen'),
  }),
)

export type ScreenChangedEvt = s.Infer<typeof schema>

export type MsgShared = ScreenChangedEvt

export const init = (screen: Screen): ScreenChangedEvt => {
  return {
    t: 'screen-evt.screen-changed',
    screen,
  }
}

const is = (evt: unknown): evt is ScreenChangedEvt => {
  return isOk(schema.parse(evt))
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
