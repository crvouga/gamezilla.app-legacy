import { Result } from '~/@/result'
import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'

const Route = p.or(
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

export type Route = p.Infer<typeof Route>

export const toRoute = (x: unknown): Route | null => Result.unwrapOr(Route.parse(x), null)
