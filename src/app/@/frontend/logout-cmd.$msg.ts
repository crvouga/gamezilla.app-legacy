import { s } from '~/@/schema'
import { isOk } from '~/@/result'

const schema = s.obj({
  t: s.l('logout-cmd'),
})

export type LogoutCmd = s.Infer<typeof schema>

export type MsgShared = LogoutCmd

const init = (): LogoutCmd => {
  return {
    t: 'logout-cmd',
  }
}

const is = (cmd: unknown): cmd is LogoutCmd => {
  return isOk(schema.parse(cmd))
}

export const LogoutCmd = {
  init,
  is,
}
