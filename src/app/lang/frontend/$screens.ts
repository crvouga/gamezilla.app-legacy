import { Result } from '~/@/result'
import { p } from '~/@/schema'

const Screen = p.obj({
  n: p.l('lang'),
  t: p.l('choose-lang'),
})

export type Screen = p.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
