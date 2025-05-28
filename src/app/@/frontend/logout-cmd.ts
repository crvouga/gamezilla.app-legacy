import { p } from '~/@/parser'
import { isOk } from '~/@/result'

const parser = p.obj({
  t: p.l('logout-cmd'),
})

export type LogoutCmd = p.Infer<typeof parser>

const init = (): LogoutCmd => {
  return {
    t: 'logout-cmd',
  }
}

const is = (cmd: unknown): cmd is LogoutCmd => {
  return isOk(parser.parse(cmd))
}

export const LogoutCmd = {
  init,
  is,
}
