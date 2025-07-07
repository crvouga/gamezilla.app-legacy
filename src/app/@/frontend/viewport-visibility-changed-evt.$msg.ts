import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('viewport-visibility-changed'),
    state: s.or(s.l('visible'), s.l('hidden')),
  }),
)

export type ViewportVisibilityChangedEvt = s.Infer<typeof schema>

export type MsgShared = ViewportVisibilityChangedEvt

export const init = (state: 'visible' | 'hidden'): ViewportVisibilityChangedEvt => {
  return {
    t: 'viewport-visibility-changed',
    state,
  }
}

const is = (evt: unknown): evt is ViewportVisibilityChangedEvt => {
  return isOk(schema.parse(evt))
}

export const ViewportVisibilityChangedEvt = {
  is,
  init,
}
