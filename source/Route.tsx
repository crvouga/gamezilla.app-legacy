import { Navigation, Option, Sub, pipe } from "Core"

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
  | { type: "Logout" }
  | { type: "ProfileCreate" }
  | { type: "ProfileDelete" }
  | { type: "ProfileUpdate" }
  | { type: "ProfileUpdateAvatar" }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "ProfileUpdateTheme" }
  | { type: "Game" }
  | { type: "Chat" }
  | { type: "ChatNew" }
  | { type: "ChatConversation"; conversationId: string }

//
//
//
// Encode/Decode
//
//
//

const routesTypes: { [routeType in Route["type"]]: string } = {
  Account: "Account",
  Home: "Home",
  Login: "Login",
  Logout: "Logout",
  ProfileCreate: "ProfileCreate",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  ProfileUpdateTheme: "ProfileUpdateTheme",
  Game: "Game",
  Chat: "Chat",
  ChatNew: "ChatNew",
  ChatConversation: "ChatConversation",
}

const isRouteType = (routeType: unknown): routeType is Route["type"] => {
  return typeof routeType === "string" && routeType in routesTypes
}

export const decode = (pathname: string): Option.Option<Route> => {
  const [first, second] = pathname.substring(1).split("/")

  if (isRouteType(first)) {
    if (first === "ChatConversation") {
      if (typeof second === "string") {
        return Option.Some({ type: "ChatConversation", conversationId: second })
      }

      return Option.None
    }

    return Option.Some({ type: first })
  }

  return Option.None
}

export const encode = (route: Route): string => {
  if (route.type === "ChatConversation") {
    return [route.type, route.conversationId].join("/")
  }

  return route.type
}

//
//
//
// Cmds
//
//
//

export const push = <TMsg,>(route: Route) => {
  return Navigation.push<TMsg>(encode(route))
}

export const back = <TMsg,>() => {
  return Navigation.back<TMsg>()
}

export const replace = <TMsg,>(route: Route) => {
  return Navigation.replace<TMsg>(encode(route))
}

//
//
//
// Msg
//
//
//

export const GotRoute = (route: Route) => {
  return {
    group: "Route",
    type: "GotRoute",
    route,
  } as const
}

export type GotRoute = ReturnType<typeof GotRoute>

export type Msg = GotRoute
