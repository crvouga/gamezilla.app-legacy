import { p } from '~/@/schema'
import { isOk } from '~/@/result'
import { Screen, toScreen } from '~/@/screen/generated/screens'

export const parser = p.or(
  p.obj({
    t: p.l('replace'),
    screen: p.custom((input): input is Screen => toScreen(input) !== null, 'invalid screen'),
    playSound: p.maybe(p.bool),
  }),
)

export type ReplaceScreenCmd = p.Infer<typeof parser>

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
