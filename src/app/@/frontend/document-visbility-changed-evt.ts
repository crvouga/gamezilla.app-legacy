import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('document-visibility-changed'),
    state: s.or(s.l('visible'), s.l('hidden')),
  }),
)

export type DocumentVisibilityChangedEvt = s.Infer<typeof schema>

export const init = (state: 'visible' | 'hidden'): DocumentVisibilityChangedEvt => {
  return {
    t: 'document-visibility-changed',
    state,
  }
}

const is = (evt: unknown): evt is DocumentVisibilityChangedEvt => {
  return isOk(schema.parse(evt))
}

export const DocumentVisibilityChangedEvt = {
  is,
  init,
}
