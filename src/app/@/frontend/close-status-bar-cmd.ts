import { p } from '~/@/schema'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('status-bar'),
    c: p.obj({
      t: p.l('close'),
    }),
  }),
)

export type CloseStatusBarCmd = p.Infer<typeof parser>

export const init = (): CloseStatusBarCmd => {
  return {
    t: 'status-bar',
    c: {
      t: 'close',
    },
  }
}

const is = (cmd: unknown): cmd is CloseStatusBarCmd => {
  return isOk(parser.parse(cmd))
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
