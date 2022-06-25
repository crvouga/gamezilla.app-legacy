import { Navigation, Sub, Task, pipe } from "Core"

//
//
//
// Model
//
//
//

export type Model =
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
// Init
//
//
//

export type Flags = {
  location: Navigation.Location
}

export const getFlags: Task.Task<Flags> = async () => {
  return {
    location: await Navigation.getLocation(),
  }
}

export const init = (flags: Flags): Model => {
  return decode(flags.location.pathname) ?? { type: "Home" }
}

//
//
//
// Msg
//
//
//

export const RecievedRoute = (route: Model) =>
  ({ group: "Route", type: "RecievedRoute", route } as const)
export type RecievedRoute = ReturnType<typeof RecievedRoute>

export const Push = (route: Model) => {
  return {
    group: "Route",
    type: "Push",
    route,
  } as const
}

export type Msg = RecievedRoute

//
//
//
// Cmds
//
//
//

export const push = <TMsg,>(route: Model) => {
  return Navigation.push<TMsg>(encode(route))
}

export const back = <TMsg,>() => {
  return Navigation.back<TMsg>()
}

export const replace = <TMsg,>(route: Model) => {
  return Navigation.replace<TMsg>(encode(route))
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub.Sub<Msg> => {
  return pipe(
    Navigation.subscription,

    Sub.map((location) =>
      RecievedRoute(decode(location.pathname) ?? { type: "Home" }),
    ),
  )
}

//
//
//
// Encode/Decode
//
//
//

const routesTypes: { [routeType in Model["type"]]: string } = {
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

const isRouteType = (routeType: unknown): routeType is Model["type"] => {
  return typeof routeType === "string" && routeType in routesTypes
}

export const decode = (pathname: string): Model | undefined => {
  const [first, second] = pathname.substring(1).split("/")

  if (isRouteType(first)) {
    if (first === "ChatConversation") {
      if (typeof second === "string") {
        return { type: "ChatConversation", conversationId: second }
      }

      return undefined
    }

    return { type: first }
  }

  return undefined
}

export const encode = (route: Model): string => {
  if (route.type === "ChatConversation") {
    return [route.type, route.conversationId].join("/")
  }

  return route.type
}
