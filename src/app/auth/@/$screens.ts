import { Result } from '~/@/result'
import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'

const Screen = p.or(
  p.obj({
    n: p.l('auth-login'),
    t: p.l('login'),
  }),
  p.obj({
    n: p.l('auth-login'),
    t: p.l('login-sms-request'),
  }),
  p.obj({
    n: p.l('auth-login'),
    t: p.l('login-sms-verify'),
    phoneNumber: PhoneNumber,
  }),
  p.obj({
    n: p.l('auth-login'),
    t: p.l('login-email-send-link'),
  }),
)

export type Screen = p.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
