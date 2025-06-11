import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('status-bar'),
    c: s.obj({
      t: s.l('close'),
    }),
  }),
)

export type CloseStatusBarCmd = s.Infer<typeof schema>

export type MsgShared = CloseStatusBarCmd

export const init = (): CloseStatusBarCmd => {
  return {
    t: 'status-bar',
    c: {
      t: 'close',
    },
  }
}

const is = (cmd: unknown): cmd is CloseStatusBarCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      return is(cmd)
    }),
  )
}

export const CloseStatusBarCmd = {
  is,
  init,
  did,
}
