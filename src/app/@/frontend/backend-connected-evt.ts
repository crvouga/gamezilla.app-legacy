import { p } from '~/@/parser'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('backend-evt.connected'),
  }),
)

export type BackendConnectedEvt = p.Infer<typeof parser>

export const init = (): BackendConnectedEvt => {
  return {
    t: 'backend-evt.connected',
  }
}

const is = (evt: unknown): evt is BackendConnectedEvt => {
  return isOk(parser.parse(evt))
}

const did = (output?: { msgEvt?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgEvt?.some((evt) => {
      if (is(evt)) {
        return true
      }
      return false
    }),
  )
}

export const BackendConnectedEvt = {
  is,
  init,
  did,
}
