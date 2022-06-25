import * as Games from "Games"
import * as Route from "Route"
import * as Session from "Session"
import * as Snackbar from "Snackbar"
import * as Store from "Store"
import * as View from "View"
import { Cmd, Sub, pipe } from "Core"
import { exhaustive } from "Utility"
import * as Account from "./Account"
import * as Chat from "./Chat"
import * as ChatConversation from "./ChatConversation"
import * as ChatNew from "./ChatNew"
import * as Game from "./Game"
import * as Home from "./Home"
import * as Login from "./Login"
import * as Logout from "./Logout"
import * as ProfileCreate from "./ProfileCreate"
import * as ProfileDelete from "./ProfileDelete"
import * as ProfileUpdate from "./ProfileUpdate"
import * as ProfileUpdateAvatar from "./ProfileUpdateAvatar"
import * as ProfileUpdateName from "./ProfileUpdateName"
import * as ProfileUpdateTheme from "./ProfileUpdateTheme"
import * as ProfileUpdateUsername from "./ProfileUpdateUsername"

//
//
//
// Model
//
//
//

export type Model =
  | (Login.Model & { page: "Login" })
  | (ProfileCreate.Model & { page: "ProfileCreate" })
  | (Logout.Model & { page: "Logout" })
  | (Home.Model & { page: "Home" })
  | (Account.Model & { page: "Account" })
  | (Logout.Model & { page: "Logout" })
  | (ProfileDelete.Model & { page: "ProfileDelete" })
  | (ProfileUpdate.Model & { page: "ProfileUpdate" })
  | (ProfileUpdateAvatar.Model & { page: "ProfileUpdateAvatar" })
  | (ProfileUpdateName.Model & { page: "ProfileUpdateName" })
  | (ProfileUpdateUsername.Model & { page: "ProfileUpdateUsername" })
  | (ProfileUpdateTheme.Model & { page: "ProfileUpdateTheme" })
  | (Chat.Model & { page: "Chat" })
  | (ChatNew.Model & { page: "ChatNew" })
  | (ChatConversation.Model & { page: "ChatConversation" })
  | { page: "Game" }
  | { page: "Loading" }

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd.Cmd<Msg>] => {
  return [{ page: "Loading" }, Cmd.none]
}

export const initReady = (
  route: Route.Model,
  profile: Store.Profile.Profile,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (route.type) {
    case "Account":
      return [{ ...Account.init, page: "Account" }, Cmd.none, []]

    case "Chat":
      return [{ ...Chat.init, page: "Chat" }, Cmd.none, []]

    case "ChatNew":
      const [chatNew, chatNewCmd, actions] = ChatNew.init()

      return [
        { ...chatNew, page: "ChatNew" },
        pipe(
          chatNewCmd,
          Cmd.map((msg) => ({ ...msg, page: "ChatNew" })),
        ),
        actions,
      ]

    case "ChatConversation":
      return [
        { ...ChatConversation.init, page: "ChatConversation" },
        Cmd.none,
        [],
      ]

    case "Game":
      return [{ page: "Game" }, Cmd.none, []]

    case "Home":
      return [{ ...Home.init, page: "Home" }, Cmd.none, []]

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, Cmd.none, []]

    case "ProfileDelete":
      return [{ ...ProfileDelete.init, page: "ProfileDelete" }, Cmd.none, []]

    case "ProfileUpdate":
      return [{ ...ProfileUpdate.init, page: "ProfileUpdate" }, Cmd.none, []]

    case "ProfileUpdateAvatar":
      return [
        {
          ...ProfileUpdateAvatar.init(profile),
          page: "ProfileUpdateAvatar",
        },
        Cmd.none,
        [],
      ]

    case "ProfileUpdateName":
      return [
        {
          ...ProfileUpdateName.init(profile),
          page: "ProfileUpdateName",
        },
        Cmd.none,
        [],
      ]

    case "ProfileUpdateUsername":
      return [
        {
          ...ProfileUpdateUsername.init(profile),
          page: "ProfileUpdateUsername",
        },
        Cmd.none,
        [],
      ]

    case "ProfileUpdateTheme":
      return [
        {
          ...ProfileUpdateTheme.init,
          page: "ProfileUpdateTheme",
        },
        Cmd.none,
        [],
      ]

    case "ProfileCreate":
    case "Login":
      return [{ ...Home.init, page: "Home" }, Route.push({ type: "Home" }), []]

    default:
      return exhaustive(route)
  }
}

export const initSessionMissing = (
  route: Route.Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "Login":
      return [{ ...Login.init, page: "Login" }, Cmd.none]

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Game":
    case "Home":
    case "Logout":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "ProfileUpdateTheme":
      return [{ ...Login.init, page: "Login" }, Route.push({ type: "Login" })]

    default:
      return exhaustive(route)
  }
}

export const initProfileMissing = (
  route: Route.Model,
  session: Session.Session,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "ProfileCreate":
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        Cmd.none,
      ]

    case "Logout":
      return [{ ...Logout.init, page: "Logout" }, Cmd.none]

    case "Login":
    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Game":
    case "Home":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "ProfileUpdateTheme":
      return [
        { ...ProfileCreate.init(session), page: "ProfileCreate" },
        Route.push({ type: "ProfileCreate" }),
      ]

    default:
      return exhaustive(route)
  }
}

//
//
//
// Msg
//
//
//

export type Msg =
  | (Account.Msg & { page: "Account" })
  | (Home.Msg & { page: "Home" })
  | (Login.Msg & { page: "Login" })
  | (Logout.Msg & { page: "Logout" })
  | (ProfileCreate.Msg & { page: "ProfileCreate" })
  | (ProfileDelete.Msg & { page: "ProfileDelete" })
  | (ProfileUpdate.Msg & { page: "ProfileUpdate" })
  | (ProfileUpdateAvatar.Msg & { page: "ProfileUpdateAvatar" })
  | (ProfileUpdateName.Msg & { page: "ProfileUpdateName" })
  | (ProfileUpdateUsername.Msg & { page: "ProfileUpdateUsername" })
  | (Chat.Msg & { page: "Chat" })
  | (ChatNew.Msg & { page: "ChatNew" })
  | (ChatConversation.Msg & { page: "ChatConversation" })
  | (ProfileUpdateTheme.Msg & { page: "ProfileUpdateTheme" })
  | (Game.Msg & { page: "Games" })

export type GroupedMsg = Msg & { group: "Page" }

export type OutAction = Store.Action | Snackbar.Action | Games.Action

//
//
//
// Update
//
//
//

export const updateReady = (
  { profile, store }: { profile: Store.Profile.Profile; store: Store.Model },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.page) {
    case "Account":
      if (msg.page === "Account") {
        return tagUpdate("Account", Account.update(profile, msg, model))
      }
      return [model, Cmd.none, []]

    case "Home":
      if (msg.page === "Home") {
        return tagUpdate("Home", Home.update(msg, model))
      }
      return [model, Cmd.none, []]

    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate("Logout", Logout.update(profile, msg, model))
      }
      return [model, Cmd.none, []]

    case "ProfileDelete":
      if (msg.page === "ProfileDelete") {
        return tagUpdate(
          "ProfileDelete",
          ProfileDelete.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileUpdate":
      if (msg.page === "ProfileUpdate") {
        return tagUpdate(
          "ProfileUpdate",
          ProfileUpdate.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileUpdateAvatar":
      if (msg.page === "ProfileUpdateAvatar") {
        return tagUpdate(
          "ProfileUpdateAvatar",
          ProfileUpdateAvatar.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileUpdateName":
      if (msg.page === "ProfileUpdateName") {
        return tagUpdate(
          "ProfileUpdateName",
          ProfileUpdateName.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileUpdateUsername":
      if (msg.page === "ProfileUpdateUsername") {
        return tagUpdate(
          "ProfileUpdateUsername",
          ProfileUpdateUsername.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "Chat":
      if (msg.page === "Chat") {
        return tagUpdate("Chat", Chat.update(msg, model))
      }
      return [model, Cmd.none, []]

    case "ChatNew":
      if (msg.page === "ChatNew") {
        return tagUpdate("ChatNew", ChatNew.update(store, msg, model))
      }
      return [model, Cmd.none, []]

    case "ChatConversation":
      if (msg.page === "ChatConversation") {
        return tagUpdate(
          "ChatConversation",
          ChatConversation.update(msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileUpdateTheme":
      if (msg.page === "ProfileUpdateTheme") {
        return tagUpdate(
          "ProfileUpdateTheme",
          ProfileUpdateTheme.update(profile, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "Game":
      return [model, Cmd.none, []]

    case "Login":
    case "Loading":
    case "ProfileCreate":
      return [model, Route.push({ type: "Home" }), []]

    default:
      return exhaustive(model)
  }
}

export const updateProfileMissing = (
  session: Session.Session,
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.page) {
    case "Logout":
      if (msg.page === "Logout") {
        return tagUpdate(
          "Logout",
          Logout.update({ name: session.defaultName }, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "ProfileCreate":
      if (msg.page === "ProfileCreate") {
        return tagUpdate(
          "ProfileCreate",
          ProfileCreate.update(session, msg, model),
        )
      }
      return [model, Cmd.none, []]

    case "Home":
    case "Account":
    case "Login":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "ProfileUpdateTheme":
    case "Game":
    case "Loading":
      return [model, Route.push({ type: "ProfileCreate" }), []]

    default:
      return exhaustive(model)
  }
}

export const updateSessionMissing = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.page) {
    case "Login":
      if (msg.page === "Login") {
        return tagUpdate("Login", Login.update(msg, model))
      }
      return [model, Cmd.none, []]

    case "ProfileCreate":
    case "Home":
    case "Account":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "ProfileUpdateTheme":
    case "Game":
    case "Loading":
    case "Logout":
      return [model, Route.push({ type: "Login" }), []]

    default:
      return exhaustive(model)
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model.page) {
    case "Account":
      return Sub.none

    case "Chat":
      return Sub.none

    case "ChatNew":
      return pipe(
        ChatNew.subscriptions(model),
        Sub.map((msg) => ({ ...msg, page: "ChatNew" })),
      )

    case "ChatConversation":
      return Sub.none

    case "Game":
      return Sub.none

    case "Home":
      return Sub.none

    case "Login":
      return Sub.none

    case "Logout":
      return Sub.none

    case "ProfileCreate":
      return Sub.none

    case "ProfileDelete":
      return Sub.none

    case "ProfileUpdate":
      return Sub.none

    case "ProfileUpdateAvatar":
      return Sub.none

    case "ProfileUpdateTheme":
      return Sub.none

    case "ProfileUpdateUsername":
      return Sub.none

    case "ProfileUpdateName":
      return Sub.none

    case "Loading":
      return Sub.none

    default:
      return exhaustive(model)
  }
}

//
//
//
// View
//
//
//

export const viewReady = (
  {
    profile,
    game,
    store,
  }: {
    game: Game.Model
    profile: Store.Profile.Profile
    store: Store.Model
  },
  model: Model,
): View.View<Msg> => {
  switch (model.page) {
    case "Account":
      return tagView("Account", Account.view(profile, model))

    case "Chat":
      return tagView("Chat", Chat.view(model))

    case "ChatNew":
      return tagView(
        "ChatNew",
        ChatNew.view({ store, currentUserProfile: profile }, model),
      )

    case "ChatConversation":
      return tagView("ChatConversation", ChatConversation.view(model))

    case "Home":
      return tagView("Home", Home.view({ profile, game }, model))

    case "Logout":
      return tagView("Logout", Logout.view(model))

    case "ProfileDelete":
      return tagView("ProfileDelete", ProfileDelete.view(model))

    case "ProfileUpdate":
      return tagView("ProfileUpdate", ProfileUpdate.view(profile, model))

    case "ProfileUpdateAvatar":
      return tagView("ProfileUpdateAvatar", ProfileUpdateAvatar.view(model))

    case "ProfileUpdateName":
      return tagView("ProfileUpdateName", ProfileUpdateName.view(model))

    case "ProfileUpdateTheme":
      return tagView(
        "ProfileUpdateTheme",
        ProfileUpdateTheme.view(profile, model),
      )

    case "ProfileUpdateUsername":
      return tagView("ProfileUpdateUsername", ProfileUpdateUsername.view(model))

    case "Game":
      return tagView("Games", Game.view(game))

    case "Login":
      return viewLoading

    case "ProfileCreate":
      return viewLoading

    case "Loading":
      return viewLoading

    default:
      return exhaustive(model)
  }
}

export const viewProfileMissing = (
  session: Session.Session,
  model: Model,
): View.View<Msg> => {
  switch (model.page) {
    case "Logout":
      return tagView("Logout", Logout.view(model))

    case "ProfileCreate":
      return tagView("ProfileCreate", ProfileCreate.view(model))

    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Home":
    case "Login":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "Game":
    case "Loading":
      return viewLoading

    default:
      return exhaustive(model)
  }
}

export const viewSessionMissing = (model: Model): View.View<Msg> => {
  switch (model.page) {
    case "Login":
      return tagView("Login", Login.view(model))

    case "Account":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "Home":
    case "ProfileCreate":
    case "Logout":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "Game":
    case "Loading":
      return viewLoading

    default:
      return exhaustive(model)
  }
}

const viewLoading: View.View<Msg> = () => <View.LoadingPage />

//
//
//
// Helpers
//
//
//

const tagView = <TMsg, TPage extends Msg["page"]>(
  page: TPage,
  dom: View.View<TMsg>,
): View.View<TMsg & { page: TPage }> => {
  return pipe(
    dom,
    View.map((msg) => ({ ...msg, page })),
  )
}

const tagUpdate = <TModel, TMsg, TAction, TPage extends Msg["page"]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd.Cmd<TMsg>, TAction[]]
    | [TModel, Cmd.Cmd<TMsg>],
): [TModel & { page: TPage }, Cmd.Cmd<TMsg & { page: TPage }>, TAction[]] => {
  return [
    {
      ...modelPrev,
      page,
    },
    pipe(
      cmdPrev,
      Cmd.map((msg) => ({ ...msg, page })),
    ),
    [...actionsPrev],
  ]
}
