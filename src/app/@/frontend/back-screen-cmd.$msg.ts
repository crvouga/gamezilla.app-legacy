import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('back'),
    playSound: s.maybe(s.bool),
  }),
)

export type BackScreenCmd = s.Infer<typeof schema>

export type MsgShared = BackScreenCmd

export const init = (playSound?: boolean): BackScreenCmd => {
  return {
    t: 'back',

    playSound,
  }
}

const is = (cmd: unknown): cmd is BackScreenCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return true
      }
      return false
    }),
  )
}

export const BackScreenCmd = {
  is,
  init,
  did,
}
