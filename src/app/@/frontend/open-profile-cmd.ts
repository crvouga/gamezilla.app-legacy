import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { UserId } from '../data/user-id'

const parser = p.obj({
  t: p.l('open-profile'),
  userId: UserId,
})

export type OpenProfileCmd = p.Infer<typeof parser>

const init = (userId: UserId): OpenProfileCmd => {
  return {
    t: 'open-profile',
    userId,
  }
}

const is = (cmd: unknown): cmd is OpenProfileCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, userId?: UserId): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) return cmd.userId === userId
      return false
    }),
  )
}
export const OpenProfileCmd = {
  parser,
  init,
  is,
  did,
}
