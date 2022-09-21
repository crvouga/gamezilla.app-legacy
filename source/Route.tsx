import { Browser, Cmd, Option } from "./Core"
import { PhoneNumber, UserId, ISO_3166 } from "./Data"

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
  | ["LoginEmailLink"]
  | ["LoginPhone"]
  | ["LoginPhoneVerify", { phoneNumber: PhoneNumber.PhoneNumber }]
  | ["Logout"]
  | ["Profile", { userId: UserId.UserId }]
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
  | ["ChatConversation", { conversationId: string }]
  | ["Search"]
  | ["Home"]

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Model[0]]: string } = {
  Account: "Account",
  Login: "Login",
  LoginEmailLink: "LoginEmailLink",
  LoginPhone: "LoginPhone",
  LoginPhoneVerify: "LoginPhoneVerify",
  Logout: "Logout",
  Profile: "Profile",
  ProfileCreate: "ProfileCreate",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  ProfileUpdateTheme: "ProfileUpdateTheme",
  GameRoom: "GameRoom",
  Party: "Party",
  Chat: "Chat",
  ChatNew: "ChatNew",
  ChatConversation: "ChatConversation",
  Search: "Search",
  Home: "Home"
}

export const isRouteType = (routeType: unknown): routeType is Model[0] => {
  return typeof routeType === "string" && routeType in routesTypes
}

export const decode = ({
  pathname,
  query,
}: Browser.Location): Option.Option<Model> => {
  const [first, second] = pathname.substring(1).split("/")

  if (!isRouteType(first)) {
    return Option.None
  }

  switch (first) {
    case "ChatConversation": {
      if (typeof second === "string") {
        return Option.Some(["ChatConversation", { conversationId: second }])
      }

      return Option.None
    }

    case "Profile": {
      const userId = UserId.decode(second)

      if (userId.type === "Ok") {
        return Option.Some(["Profile", { userId: userId.value }])
      }

      return Option.None
    }

    case "LoginPhoneVerify": {
      const phoneNumberDirty = query["phoneNumber"]
      const country = query["country"]

      if (!phoneNumberDirty) {
        return Option.None
      }

      if (!ISO_3166.is(country)) {
        return Option.None
      }

      const decoded = PhoneNumber.decode(country, phoneNumberDirty)

      if (decoded.type === "Err") {
        return Option.None
      }

      const phoneNumber = decoded.value

      return Option.Some(["LoginPhoneVerify", { phoneNumber: phoneNumber }])
    }

    default: {
      return Option.Some([first])
    }
  }
}

export const encode = (route: Model): string => {
  switch (route[0]) {
    case "ChatConversation":
      return `/${route[0]}/${route[1].conversationId}`

    case "Profile":
      return `/${route[0]}/${route[1].userId}`

    case "LoginPhoneVerify": {
      const phoneNumber = PhoneNumber.toString(route[1].phoneNumber)
      const country = PhoneNumber.toCountry(route[1].phoneNumber)
      const params = new URLSearchParams({ phoneNumber, country })
      return `/${route[0]}?${params.toString()}`
    }

    default:
      return `/${route[0]}`
  }
}

//
//
//
// Cmd
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
