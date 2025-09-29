import { isOk } from '~/@/result'
import { s } from '~/@/schema'

export const schema = s.or(
  s.obj({
    t: s.l('app-evt.app-ready'),
  }),
)

export type AppReadyEvt = s.Infer<typeof schema>

export type MsgShared = AppReadyEvt

export const init = (): AppReadyEvt => {
  return {
    t: 'app-evt.app-ready',
  }
}

const is = (evt: unknown): evt is AppReadyEvt => {
  return isOk(schema.parse(evt))
}

export const AppReadyEvt = {
  is,
  init,
}
