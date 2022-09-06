import { Browser, Cmd, Option } from "./Core"
import { UserId } from "./Data"

//
//
//
// Model
//
//
//

export type Model =
  | ["Account"]
  | ["Login"]
  | ["LoginEmail"]
  | ["AccountCreate"]
  | ["PasswordReset"]
  | ["Logout"]
  | ["Profile", UserId.UserId]
  | ["ProfileCreate"]
  | ["ProfileDelete"]
  | ["ProfileUpdate"]
  | ["ProfileUpdateAvatar"]
  | ["ProfileUpdateName"]
  | ["ProfileUpdateUsername"]
  | ["ProfileUpdateTheme"]
  | ["GameRoom"]
  | ["Party"]
  | ["Chat"]
  | ["ChatNew"]
  | ["ChatConversation", string]
  | ["Search"]
  | ["Admin", "Model" | "Msg"]

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Model[0]]: string } = {
  Admin: "Admin",
  Account: "Account",
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
  Party: "Party",
  Chat: "Chat",
  ChatNew: "ChatNew",
  ChatConversation: "ChatConversation",
  Search: "Search",
}

export const isRouteType = (routeType: unknown): routeType is Model[0] => {
  return typeof routeType === "string" && routeType in routesTypes
}

export const decode = ({
  pathname,
}: {
  pathname: string
}): Option.Option<Model> => {
  const [first, second] = pathname.substring(1).split("/")

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

export const encode = (route: Model): string => {
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

export const push = (route: Model) => {
  return Browser.push(encode(route))
}

export const back = Browser.back

export const replace = (route: Model) => {
  return Browser.replace(encode(route))
}

//
//
//
// Update
//
//
//

export type Msg = ["GotRoute", Model]

export type Action = ["Push", Model] | ["Replace", Model] | ["Back"]

export const update = (msg: Msg): Model => {
  switch (msg[0]) {
    case "GotRoute": {
      return msg[1]
    }
  }
}

export const runAction = (
  model: Model,
  action: Action,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Back": {
      return [model, Browser.back]
    }

    case "Push": {
      return [model, Browser.push(encode(action[1]))]
    }

    case "Replace": {
      return [model, Browser.replace(encode(action[1]))]
    }
  }
}

//
//
//
// Helpers
//
//
//

export const equals = (a: Model, b: Model): boolean => {
  return encode(a) === encode(b)
}
