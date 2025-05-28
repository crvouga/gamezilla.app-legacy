import { p } from '~/@/parser'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('document-visibility-changed'),
    state: p.or(p.l('visible'), p.l('hidden')),
  }),
)

export type DocumentVisibilityChangedEvt = p.Infer<typeof parser>

export const init = (state: 'visible' | 'hidden'): DocumentVisibilityChangedEvt => {
  return {
    t: 'document-visibility-changed',
    state,
  }
}

const is = (evt: unknown): evt is DocumentVisibilityChangedEvt => {
  return isOk(parser.parse(evt))
}

export const DocumentVisibilityChangedEvt = {
  is,
  init,
}
