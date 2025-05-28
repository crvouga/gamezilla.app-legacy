import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { PhoneNumber } from '~/@/phone-number'

const Screen = s.or(
  s.obj({
    n: s.l('auth-login'),
    t: s.l('login'),
  }),
  s.obj({
    n: s.l('auth-login'),
    t: s.l('login-sms-request'),
  }),
  s.obj({
    n: s.l('auth-login'),
    t: s.l('login-sms-verify'),
    phoneNumber: PhoneNumber,
  }),
  s.obj({
    n: s.l('auth-login'),
    t: s.l('login-email-send-link'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
