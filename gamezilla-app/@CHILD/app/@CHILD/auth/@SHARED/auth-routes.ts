//
//
//
// Model
//
//
//

import { Location } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Namespace } from "gamezilla-app/@SHARED/msg"

const Msg = Namespace("auth")

export const AuthRoutes = {
  Login: Msg("Login"),
  LoginSMS: {
    Request: Msg("LoginSMS-Request"),
    Verify: Msg("LoginSMS-Verify"),
  },
  Logout: Msg("Logout"),
}

export type AuthRoute =
  | {
      t: "/"
      c: Location
    }
  | {
      t: "/sms"
      c: Location
    }

const encode = (route: AuthRoute): string => {
  switch (route.t) {
    case "/":
      return "/"
    case "/sms":
      return "/sms"
  }
}

const decode = (pathname: string): AuthRoute | null => {
  if (pathname.startsWith("/sms")) {
    const child = pathname.slice(4)

    return {
      t: "/sms",
      c: {
        pathname: child,
        searchParams: new URLSearchParams(),
      },
    }
  }

  if (pathname === "/") {
    return {
      t: "/",
      c: {
        pathname: "/",
        searchParams: new URLSearchParams(),
      },
    }
  }

  return null
}

export const toRoute = (location: Location): AuthRoute => {
  const route = decode(location.pathname)
  if (route === null) {
    return {
      t: "/",
      c: location,
    }
  }
  return route
}

export const Route = {
  encode,
  decode,
}
