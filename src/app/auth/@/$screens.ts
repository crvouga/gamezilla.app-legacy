import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'

const Screen = s.or(
  s.obj({
    n: s.l('auth'),
    t: s.l('login'),
  }),
  s.obj({
    n: s.l('auth'),
    t: s.l('send-code'),
  }),
  s.obj({
    n: s.l('auth'),
    t: s.l('verify-code'),
    phoneNumber: PhoneNumber,
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
