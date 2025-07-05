import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('app-bar'),
    c: s.obj({
      t: s.l('close'),
    }),
  }),
)

export type CloseAppBarCmd = s.Infer<typeof schema>

export type MsgShared = CloseAppBarCmd

export const init = (): CloseAppBarCmd => {
  return {
    t: 'app-bar',
    c: {
      t: 'close',
    },
  }
}

const is = (cmd: unknown): cmd is CloseAppBarCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      return is(cmd)
    }),
  )
}

export const CloseAppBarCmd = {
  is,
  init,
  did,
}
