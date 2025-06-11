import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { Screen, toScreen } from '~/@/screen/generated/screens'

export const schema = s.or(
  s.obj({
    t: s.l('push'),
    screen: s.custom((input): input is Screen => toScreen(input) !== null, 'invalid screen'),
    playSound: s.maybe(s.bool),
  }),
)

export type PushScreenCmd = s.Infer<typeof schema>

export type MsgShared = PushScreenCmd

export const init = (screen: Screen, playSound?: boolean): PushScreenCmd => {
  return {
    t: 'push',
    screen,
    playSound,
  }
}

const is = (cmd: unknown): cmd is PushScreenCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, predicate?: (s: Screen) => boolean): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return predicate ? predicate(cmd.screen as Screen) : true
      }
      return false
    }),
  )
}

export const PushScreenCmd = {
  is,
  init,
  did,
}
