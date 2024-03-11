import { PhoneNumber } from "gamezilla-app/@SHARED/core"
import { Namespace } from "gamezilla-app/@SHARED/msg"
import { P } from "gamezilla-app/@SHARED/parsing"

const Msg = Namespace("auth")

const Login = Msg("Login")
const LoginSMSRequest = Msg("LoginSMS-Request")
const LoginSMSVerify = Msg<{ phoneNumber: PhoneNumber }>("LoginSMS-Verify")
const Logout = Msg("Logout")

const is = (route: unknown) => {
  return (
    Login.is(route) ||
    LoginSMSRequest.is(route) ||
    LoginSMSVerify.is(route) ||
    Logout.is(route)
  )
}

export const AuthRoutes = {
  is,
  Login,
  LoginSMSRequest,
  LoginSMSVerify,
  Logout,
}

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
    }
  | {
      n: "auth-logout"
      t: "logout"
    }

export const toRoute = P.union<Route>([
  (x) =>
    P.obj(x) && P.tag(x, "n", "auth-login") && P.tag(x, "t", "login")
      ? x
      : null,
  (x) =>
    P.obj(x) &&
    P.tag(x, "n", "auth-login") &&
    P.tag(x, "t", "login-sms-request")
      ? x
      : null,
  (x) =>
    P.obj(x) && P.tag(x, "n", "auth-login") && P.tag(x, "t", "login-sms-verify")
      ? x
      : null,
  (x) =>
    P.obj(x) && P.tag(x, "n", "auth-logout") && P.tag(x, "t", "logout")
      ? x
      : null,
])
