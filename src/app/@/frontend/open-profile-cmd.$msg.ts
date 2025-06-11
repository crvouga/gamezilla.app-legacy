import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { UserId } from '../data/user-id'

const schema = s.obj({
  t: s.l('open-profile'),
  userId: UserId,
})

export type OpenProfileCmd = s.Infer<typeof schema>

export type MsgShared = OpenProfileCmd

const init = (userId: UserId): OpenProfileCmd => {
  return {
    t: 'open-profile',
    userId,
  }
}

const is = (cmd: unknown): cmd is OpenProfileCmd => {
  return isOk(schema.parse(cmd))
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
  schema,
  init,
  is,
  did,
}
