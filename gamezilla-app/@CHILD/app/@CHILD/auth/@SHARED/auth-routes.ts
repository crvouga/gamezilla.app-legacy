import { PhoneNumber } from "gamezilla-app/@SHARED/core"
import { Namespace } from "gamezilla-app/@SHARED/msg"

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
