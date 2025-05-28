import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('backend-evt.connected'),
  }),
)

export type BackendConnectedEvt = s.Infer<typeof schema>

export const init = (): BackendConnectedEvt => {
  return {
    t: 'backend-evt.connected',
  }
}

const is = (evt: unknown): evt is BackendConnectedEvt => {
  return isOk(schema.parse(evt))
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
