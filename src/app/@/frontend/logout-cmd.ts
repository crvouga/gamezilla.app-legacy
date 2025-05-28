import { s } from '~/@/schema'
import { isOk } from '~/@/result'

const parser = s.obj({
  t: s.l('logout-cmd'),
})

export type LogoutCmd = s.Infer<typeof parser>

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
