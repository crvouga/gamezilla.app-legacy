import { p } from '~/@/schema'
import { isOk } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'

export const parser = p.or(
  p.obj({
    t: p.l('space-cmd.open-user-details'),
    userId: p.custom((input): input is UserId => typeof input === 'string', 'invalid user id'),
  }),
)

export type OpenUserDetailsCmd = p.Infer<typeof parser>

export const init = (userId: UserId): OpenUserDetailsCmd => {
  return {
    t: 'space-cmd.open-user-details',
    userId,
  }
}

const is = (cmd: unknown): cmd is OpenUserDetailsCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, userId?: UserId): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return userId ? cmd.userId === userId : true
      }
      return false
    }),
  )
}

export const OpenUserDetailsCmd = {
  is,
  init,
  did,
}
