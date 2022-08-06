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
  | { type: "Account" }
  | { type: "Home" }
  | { type: "Login" }
  | { type: "LoginEmail" }
  | { type: "AccountCreate" }
  | { type: "PasswordReset" }
  | { type: "Logout" }
  | { type: "Profile"; userId: UserId.UserId }
  | { type: "ProfileCreate" }
  | { type: "ProfileDelete" }
  | { type: "ProfileUpdate" }
  | { type: "ProfileUpdateAvatar" }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "ProfileUpdateTheme" }
  | { type: "Game" }
  | { type: "GameRoom" }
  | { type: "Chat" }
  | { type: "ChatNew" }
  | { type: "ChatConversation"; conversationId: string }
  | { type: "Search" }
  | { type: "Admin"; tab: "Model" | "Msg" }

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Route["type"]]: string } = {
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
  Game: "Game",
  GameRoom: "GameRoom",
  Chat: "Chat",
  ChatNew: "ChatNew",
  ChatConversation: "ChatConversation",
  Search: "Search",
}

export const isRouteType = (routeType: unknown): routeType is Route["type"] => {
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
        return Option.Some({
          type: "ChatConversation",
          conversationId: second,
        })
      }

      return Option.None
    }

    case "Profile": {
      const userId = UserId.decode(second)
      if (userId.type === "Ok") {
        return Option.Some({
          type: "Profile",
          userId: userId.value,
        })
      }
      return Option.None
    }

    case "Admin": {
      if (
        typeof second === "string" &&
        (second === "Model" || second === "Msg")
      ) {
        return Option.Some({
          type: "Admin",
          tab: second,
        })
      }
      return Option.None
    }

    // case 'GameRoom': {
    //   if (typeof second === "string") {
    //     return Option.Some({
    //       type: "GameRoom",
    //       roomId: second,
    //     })
    //   }
    //   return Option.None
    // }

    default: {
      return Option.Some({ type: first })
    }
  }
}

export const encode = (route: Route): string => {
  switch (route.type) {
    case "ChatConversation":
      return `/${route.type}/${route.conversationId}`

    case "Profile":
      return `/${route.type}/${route.userId}`

    case "Admin":
      return `/${route.type}/${route.tab}`

    // case 'GameRoom':
    //   return `/${route.type}/${route.roomId}`

    default:
      return `/${route.type}`
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
