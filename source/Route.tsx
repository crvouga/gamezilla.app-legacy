import { pipe } from "fp-ts/lib/function"
import { sub } from "Core"
import * as Navigation from "Core/Navigation"
import { Sub } from "Core/Sub"

//
//
// Model
//
//

export type Model = Route

export type Route =
  | Account
  | Home
  | Login
  | Logout
  | ProfileCreate
  | ProfileDelete
  | ProfileUpdate
  | ProfileUpdateAvatar
  | ProfileUpdateName
  | ProfileUpdateUsername
  | ProfileUpdateTheme
  | Game
  | Chat
  | ChatNew
  | ChatConversation

export type Account = { type: "Account" }
export type Home = { type: "Home" }
export type Login = { type: "Login" }
export type Logout = { type: "Logout" }
export type ProfileCreate = { type: "ProfileCreate" }
export type ProfileDelete = { type: "ProfileDelete" }
export type ProfileUpdate = { type: "ProfileUpdate" }
export type ProfileUpdateAvatar = { type: "ProfileUpdateAvatar" }
export type ProfileUpdateName = { type: "ProfileUpdateName" }
export type ProfileUpdateUsername = { type: "ProfileUpdateUsername" }
export type ProfileUpdateTheme = { type: "ProfileUpdateTheme" }
export type Game = { type: "Game" }
export type Chat = { type: "Chat" }
export type ChatNew = { type: "ChatNew" }
export type ChatConversation = {
  type: "ChatConversation"
  conversationId: string
}

//
//
// encode/decode
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

export const decode = (pathname: string): Route | undefined => {
  const [part0, part1] = pathname.substring(1).split("/")

  if (isRouteType(part0)) {
    if (part0 === "ChatConversation") {
      if (typeof part1 === "string") {
        return { type: "ChatConversation", conversationId: part1 }
      }

      return undefined
    }

    return { type: part0 }
  }

  return undefined
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
// Msg
//
//
//

export type GroupedMsg = Msg & { group: "Route" }

export type Msg = RecievedRoute

export const RecievedRoute = (route: Route) =>
  ({ type: "RecievedRoute", route } as const)

export type RecievedRoute = ReturnType<typeof RecievedRoute>

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub<Msg> => {
  return pipe(
    Navigation.subscription,
    sub.map((location) =>
      RecievedRoute(decode(location.pathname) ?? { type: "Home" })
    )
  )
}

//
//
//
// Navigation
//
//
//

export const push = <TMsg,>(route: Route) => {
  return Navigation.push<TMsg>(encode(route))
}
