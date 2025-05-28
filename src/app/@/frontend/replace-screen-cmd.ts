import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { Screen, toScreen } from '~/@/screen/generated/screens'

export const parser = s.or(
  s.obj({
    t: s.l('replace'),
    screen: s.custom((input): input is Screen => toScreen(input) !== null, 'invalid screen'),
    playSound: s.maybe(s.bool),
  }),
)

export type ReplaceScreenCmd = s.Infer<typeof parser>

export const init = (screen: Screen, playSound?: boolean): ReplaceScreenCmd => {
  return {
    t: 'replace',
    screen,
    playSound,
  }
}

const is = (cmd: unknown): cmd is ReplaceScreenCmd => {
  return isOk(parser.parse(cmd))
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

export const ReplaceScreenCmd = {
  is,
  init,
  did,
}
