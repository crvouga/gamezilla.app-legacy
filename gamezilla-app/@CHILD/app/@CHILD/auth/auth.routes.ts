import { PhoneNumber } from "gamezilla-app/@SHARED/core"
import { P1 } from "gamezilla-app/@SHARED/parsing"

export type Route =
  | {
      n: "auth-login"
      t: "login"
    }
  | {
      n: "auth-login"
      t: "login-sms-request"
    }
  | {
      n: "auth-login"
      t: "login-sms-verify"
      phoneNumber: PhoneNumber
    }

export const toRoute = P1.union<Route>([
  (x) =>
    P1.obj(x) && P1.tag(x, "n", "auth-login") && P1.tag(x, "t", "login")
      ? x
      : null,
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "auth-login") &&
    P1.tag(x, "t", "login-sms-request")
      ? x
      : null,
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "auth-login") &&
    P1.tag(x, "t", "login-sms-verify") &&
    P1.has(x, "phoneNumber", PhoneNumber.is)
      ? x
      : null,
])
