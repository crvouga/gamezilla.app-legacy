import { Browser, Option } from "./Core"
import { UserId } from "./Data"

//
//
//
// Model
//
//
//

export type Route =
  | ["Account" ]
  | ["Home" ]
  | ["Login" ]
  | ["LoginEmail" ]
  | ["AccountCreate" ]
  | ["PasswordReset" ]
  | ["Logout" ]
  | ["Profile", UserId.UserId ]
  | ["ProfileCreate" ]
  | ["ProfileDelete" ]
  | ["ProfileUpdate" ]
  | ["ProfileUpdateAvatar" ]
  | ["ProfileUpdateName" ]
  | ["ProfileUpdateUsername" ]
  | ["ProfileUpdateTheme" ]
  | ["GameRoom" ]
  | ["Chat" ]
  | ["ChatNew" ]
  | ["ChatConversation", string ]
  | ["Search" ]
  | ["Admin", "Model" | "Msg" ]

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Route[0]]: string } = {
  Admin: "Admin",
  Account: "Account",
  Home: "Home",
  Login: "Login",
  LoginEmail: "LoginEmail",
  AccountCreate: "AccountCreate",
  Logout: "Logout",
  Profile: "Profile",
  ProfileCreate: "ProfileCreate",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  ProfileUpdateTheme: "ProfileUpdateTheme",
  PasswordReset: "PasswordReset",
  GameRoom: "GameRoom",
  Chat: "Chat",
  ChatNew: "ChatNew",
  ChatConversation: "ChatConversation",
  Search: "Search",
}

export const isRouteType = (routeType: unknown): routeType is Route[0] => {
  return typeof routeType === "string" && routeType in routesTypes
}

export const decode = (location: Browser.Location): Option.Option<Route> => {
  const [first, second] = location.pathname.substring(1).split("/")

  if (!isRouteType(first)) {
    return Option.None
  }

  switch (first) {
    case "ChatConversation": {
      if (typeof second === "string") {
        return Option.Some(["ChatConversation", second])
      }

      return Option.None
    }

    case "Profile": {
      const userId = UserId.decode(second)
      if (userId.type === "Ok") {
        return Option.Some(["Profile", userId.value])
      }
      return Option.None
    }

    case "Admin": {
      if (
        typeof second === "string" &&
        (second === "Model" || second === "Msg")
      ) {
        return Option.Some(["Admin", second])
      }
      return Option.None
    }

    default: {
      return Option.Some([first])
    }
  }
}

export const encode = (route: Route): string => {
  switch (route[0]) {
    case "ChatConversation":
      return `/${route[0]}/${route[1]}`

    case "Profile":
      return `/${route[0]}/${route[1]}`

    case "Admin":
      return `/${route[0]}/${route[1]}`

    default:
      return `/${route[0]}`
  }
}

//
//
//
// Cmds
//
//
//

export const push = (route: Route) => {
  return Browser.push(encode(route))
}

export const back = Browser.back

export const replace = (route: Route) => {
  return Browser.replace(encode(route))
}

//
//
//
// Msg
//
//
//

export type GotRoute = ["GotRoute", Route]

export type Msg = GotRoute
