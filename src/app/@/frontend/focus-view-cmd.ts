import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('focus'),
    viewId: s.str,
  }),
)

export type FocusViewCmd = s.Infer<typeof schema>

export const init = (viewId: string): FocusViewCmd => {
  return {
    t: 'focus',
    viewId,
  }
}

const is = (cmd: unknown): cmd is FocusViewCmd => {
  return isOk(schema.parse(cmd))
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
