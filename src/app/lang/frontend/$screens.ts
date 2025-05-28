import { Result } from '~/@/result'
import { s } from '~/@/schema'

const Screen = s.obj({
  n: s.l('lang'),
  t: s.l('choose-lang'),
})

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
