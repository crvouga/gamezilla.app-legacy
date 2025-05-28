import { p } from '~/@/schema'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('focus'),
    viewId: p.str,
  }),
)

export type FocusViewCmd = p.Infer<typeof parser>

export const init = (viewId: string): FocusViewCmd => {
  return {
    t: 'focus',
    viewId,
  }
}

const is = (cmd: unknown): cmd is FocusViewCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, predicate?: (viewId: string) => boolean): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return predicate ? predicate(cmd.viewId) : true
      }
      return false
    }),
  )
}

export const FocusViewCmd = {
  is,
  init,
  did,
}
