import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'

const Screen = s.or(
  s.obj({
    n: s.l('auth'),
    t: s.l('auth_login'),
  }),
  s.obj({
    n: s.l('auth'),
    t: s.l('auth_sendCode'),
  }),
  s.obj({
    n: s.l('auth'),
    t: s.l('auth_verifyCode'),
    phoneNumber: PhoneNumber,
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
