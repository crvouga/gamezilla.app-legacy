import { Result } from '~/@/result'
import { s } from '~/@/schema'

const Screen = s.or(
  s.obj({
    n: s.l('settings'),
    t: s.l('main'),
    back: s.unknown,
  }),
  s.obj({
    n: s.l('settings'),
    t: s.l('choose-lang'),
  }),
  s.obj({
    n: s.l('settings'),
    t: s.l('renderer'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
