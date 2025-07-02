import { Result } from '~/@/result'
import { s } from '~/@/schema'

const Screen = s.or(
  s.obj({
    n: s.l('settings'),
    t: s.l('main'),
  }),
  s.obj({
    n: s.l('settings'),
    t: s.l('choose-lang'),
  }),
  s.obj({
    n: s.l('settings'),
    t: s.l('choose-renderer'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
