import * as Auth from "./Auth"
import { Cmd, exhaustive, pipe, Sub, tag, tagSub } from "./Core"
import { UserId } from "./Data"
import * as GameRoom from "./GameRoom/GameRoom.Frontend"
import {
  PartyPage,
  Account,
  AccountCreate,
  Chat,
  ChatConversation,
  ChatNew,
  GameRoomPage,
  Login,
  LoginEmailPassword,
  Logout,
  PasswordReset,
  Profile,
  ProfileCreate,
  ProfileDelete,
  ProfileUpdate,
  ProfileUpdateAvatar,
  ProfileUpdateName,
  ProfileUpdateTheme,
  ProfileUpdateUsername,
  Search
} from "./Page"
import * as Party from "./Party/Party.Frontend"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as Store from "./Store"
import * as UI from "./UI"


//
//
//
// Model
//
//
//

export type Model =
  | ["Login", Login.Model]
  | ["ProfileCreate", ProfileCreate.Model]
  | ["Logout", Logout.Model]
  | ["Account", Account.Model]
  | ["Profile", Profile.Model]
  | ["ProfileDelete", ProfileDelete.Model]
  | ["ProfileUpdate", ProfileUpdate.Model]
  | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Model]
  | ["ProfileUpdateName", ProfileUpdateName.Model]
  | ["ProfileUpdateUsername", ProfileUpdateUsername.Model]
  | ["ProfileUpdateTheme", ProfileUpdateTheme.Model]
  | ["Chat", Chat.Model]
  | ["ChatNew", ChatNew.Model]
  | ["PasswordReset", PasswordReset.Model]
  | ["LoginEmailPassword", LoginEmailPassword.Model]
  | ["AccountCreate", AccountCreate.Model]
  | ["Search", Search.Model]
  | ["ChatConversation", ChatConversation.Model]
  | ["GameRoom", GameRoomPage.Model]
  | ["Party", PartyPage.Model]
  | ["Admin"]
  | ["Loading"]

//
//
//
// Msg
//
//
//

export type Msg =
  | ["Account", Account.Msg]
  | ["Login", Login.Msg]
  | ["LoginEmailPassword", LoginEmailPassword.Msg]
  | ["AccountCreate", AccountCreate.Msg]
  | ["Logout", Logout.Msg]
  | ["Profile", Profile.Msg]
  | ["ProfileCreate", ProfileCreate.Msg]
  | ["ProfileDelete", ProfileDelete.Msg]
  | ["ProfileUpdate", ProfileUpdate.Msg]
  | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Msg]
  | ["ProfileUpdateName", ProfileUpdateName.Msg]
  | ["ProfileUpdateUsername", ProfileUpdateUsername.Msg]
  | ["ProfileUpdateTheme", ProfileUpdateTheme.Msg]
  | ["Chat", Chat.Msg]
  | ["GameRoom", GameRoomPage.Msg]
  | ["Party", PartyPage.Msg]
  | ["PasswordReset", PasswordReset.Msg]
  | ["ChatNew", ChatNew.Msg]
  | ["ChatConversation", ChatConversation.Msg]
  | ["Search", Search.Msg]
  | ["ClickedBottomNavigationLink", Route.Model]

export type OutAction =
  | Store.Action
  | Snackbar.Action
  | GameRoom.Action
  | Auth.Action
  | Party.Action

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd.Cmd<Msg>] => {
  return [["Loading"], Cmd.None]
}

export const initReady = (
  route: Route.Model,
  profile: Store.Profile.Profile,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (route[0]) {
    case "Account":
      return [["Account", Account.init], Cmd.None, []]

    case "Chat": {
      const [model, cmd, actions] = Chat.init(profile)
      return [["Chat", model], pipe(cmd, Cmd.map(tag("Chat"))), actions]
    }

    case "ChatNew": {
      const [chatNew, chatNewCmd, actions] = ChatNew.init()

      return [
        ["ChatNew", chatNew],
        pipe(chatNewCmd, Cmd.map(tag("ChatNew"))),
        actions,
      ]
    }

    case "ChatConversation": {
      const [model, cmd, actions] = ChatConversation.init({
        conversationId: route[1],
      })
      return [
        ["ChatConversation", model],

        pipe(cmd, Cmd.map(tag("ChatConversation"))),
        actions,
      ]
    }

    case "Logout":
      return [["Logout", Logout.init], Cmd.None, []]

    case "ProfileDelete": {
      const [modelNew, cmdNew, actions] = ProfileDelete.init
      return [
        ["ProfileDelete", modelNew],
        pipe(cmdNew, Cmd.map(tag("ProfileDelete"))),
        actions,
      ]
    }

    case "ProfileUpdate":
      return [["ProfileUpdate", ProfileUpdate.init], Cmd.None, []]

    case "ProfileUpdateAvatar":
      return [
        ["ProfileUpdateAvatar", ProfileUpdateAvatar.init(profile)],
        Cmd.None,
        [],
      ]

    case "ProfileUpdateName":
      return [
        ["ProfileUpdateName", ProfileUpdateName.init(profile)],
        Cmd.None,
        [],
      ]

    case "ProfileUpdateUsername":
      return [
        ["ProfileUpdateUsername", ProfileUpdateUsername.init(profile)],
        Cmd.None,
        [],
      ]

    case "ProfileUpdateTheme":
      return [["ProfileUpdateTheme", ProfileUpdateTheme.init], Cmd.None, []]

    case "Profile": {
      const [modelInit, cmdInit, actions] = Profile.init({
        userId: route[1],
      })
      return [
        ["Profile", modelInit],
        pipe(cmdInit, Cmd.map(tag("Profile"))),
        actions,
      ]
    }

    case "Search": {
      const [modelInit, cmdInit, actionsInit] = Search.init
      return [
        ["Search", modelInit],
        pipe(cmdInit, Cmd.map(tag("Search"))),
        actionsInit,
      ]
    }

    case "Admin":
      return [["Admin"], Cmd.None, []]

    case "GameRoom": {
      const [modelInit, cmdInit] = GameRoomPage.init
      return [
        ["GameRoom", modelInit],
        pipe(cmdInit, Cmd.map(tag("GameRoom"))),
        [],
      ]
    }

    case 'Party': {
      const [modelInit, cmdInit] = PartyPage.init
      return [
        ['Party', modelInit],
        pipe(cmdInit, Cmd.map(tag("Party"))),
        []
      ]
    }

    case "ProfileCreate":
    case "Login":
    case "LoginEmailPassword":
    case "AccountCreate":
    case "PasswordReset":
      const [modelInit, cmdInit] = GameRoomPage.init
      return [
        ["GameRoom", modelInit],
        Cmd.batch([
          Route.push(["GameRoom"]),
          pipe(cmdInit, Cmd.map(tag("GameRoom"))),
        ]),
        []
      ]

    default:
      return exhaustive(route)
  }
}

export const initLoggedOut = (route: Route.Model): [Model, Cmd.Cmd<Msg>] => {
  switch (route[0]) {
    case "Login":
      return [["Login", Login.init], Cmd.None]

    case "LoginEmailPassword":
      return [["LoginEmailPassword", LoginEmailPassword.init], Cmd.None]

    case "AccountCreate":
      const [modelNew, cmd] = AccountCreate.init()
      return [
        ["AccountCreate", modelNew],
        pipe(cmd, Cmd.map(tag("AccountCreate"))),
      ]

    case "PasswordReset":
      return [["PasswordReset", PasswordReset.init], Cmd.None]

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Admin":
    case "Logout":
    case "Profile":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "Search":
    case "ProfileUpdateTheme":
    case "GameRoom":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case 'Party':
      return [["Login", Login.init], Route.push(["Login"])]

    default:
      return exhaustive(route)
  }
}

export const initProfileMissing = (
  route: Route.Model,
  auth: Auth.Session,
): [Model, Cmd.Cmd<Msg>] => {
  switch (route[0]) {
    case "ProfileCreate":
      return [["ProfileCreate", ProfileCreate.init(auth)], Cmd.None]

    case "Logout":
      return [["Logout", Logout.init], Cmd.None]

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "Admin":
    case "Search":
    case "Profile":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Login":
    case "LoginEmailPassword":
    case "GameRoom":
    case "AccountCreate":
    case "PasswordReset":
    case 'Party':
      return [
        ["ProfileCreate", ProfileCreate.init(auth)],
        Route.push(["ProfileCreate"]),
      ]
    default:
      return exhaustive(route)
  }
}

//
//
//
// Update
//
//
//

export const updateReady = (
  {
    profile,
    store,
    gameRoom,
  }: {
    profile: Store.Profile.Profile
    store: Store.Model
    gameRoom: GameRoom.Model
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  if (msg[0] === "ClickedBottomNavigationLink") {
    return [model, Route.push(msg[1]), []]
  }

  switch (model[0]) {
    case "Account":
      if (msg[0] === "Account") {
        return tagUpdate("Account", Account.update(profile, msg[1], model[1]))
      }
      return [model, Cmd.None, []]

    case "Logout":
      if (msg[0] === "Logout") {
        return tagUpdate("Logout", Logout.update(profile, msg[1], model[1]))
      }
      return [model, Cmd.None, []]

    case "ProfileDelete":
      if (msg[0] === "ProfileDelete") {
        return tagUpdate(
          "ProfileDelete",
          ProfileDelete.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "ProfileUpdate":
      if (msg[0] === "ProfileUpdate") {
        return tagUpdate(
          "ProfileUpdate",
          ProfileUpdate.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "ProfileUpdateAvatar":
      if (msg[0] === "ProfileUpdateAvatar") {
        return tagUpdate(
          "ProfileUpdateAvatar",
          ProfileUpdateAvatar.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "ProfileUpdateName":
      if (msg[0] === "ProfileUpdateName") {
        return tagUpdate(
          "ProfileUpdateName",
          ProfileUpdateName.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "ProfileUpdateUsername":
      if (msg[0] === "ProfileUpdateUsername") {
        return tagUpdate(
          "ProfileUpdateUsername",
          ProfileUpdateUsername.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "Chat":
      if (msg[0] === "Chat") {
        return tagUpdate("Chat", Chat.update(msg[1], model[1]))
      }
      return [model, Cmd.None, []]

    case "ChatNew":
      if (msg[0] === "ChatNew") {
        return tagUpdate(
          "ChatNew",
          ChatNew.update(
            { store, currentUserId: profile.userId },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None, []]

    case "ChatConversation":
      if (msg[0] === "ChatConversation") {
        const [modelPage, cmdPage, actions] = ChatConversation.update(
          { userId: profile.userId },
          msg[1],
          model[1],
        )
        return [
          ["ChatConversation", modelPage],
          pipe(cmdPage, Cmd.map(tag("ChatConversation"))),
          actions,
        ]
      }
      return [model, Cmd.None, []]

    case "ProfileUpdateTheme":
      if (msg[0] === "ProfileUpdateTheme") {
        return tagUpdate(
          "ProfileUpdateTheme",
          ProfileUpdateTheme.update(profile, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "Profile":
      if (msg[0] === "Profile") {
        const [modelPage, cmdPage, actions] = Profile.update(
          { currentUserId: profile.userId },
          msg[1],
          model[1],
        )
        return [
          ["Profile", modelPage],
          pipe(cmdPage, Cmd.map(tag("Profile"))),
          actions,
        ]
      }

      return [model, Cmd.None, []]

    case "Search":
      if (msg[0] === "Search") {
        return tagUpdate("Search", Search.update(msg[1], model[1]))
      }

      return [model, Cmd.None, []]

    case "Admin":
      return [model, Cmd.None, []]

    case "GameRoom": {
      if (msg[0] === "GameRoom") {
        const [modelPage, cmdPage, actions] = GameRoomPage.update(
          { currentUserId: profile.userId },
          msg[1],
          model[1],
        )
        return [
          ["GameRoom", modelPage],
          pipe(cmdPage, Cmd.map(tag("GameRoom"))),
          actions,
        ]
      }

      return [model, Cmd.None, []]
    }

    case 'Party': {
      if (msg[0] === 'Party') {
        const [modelPage, cmdPage, actions] = PartyPage.update({ currentUserId: profile.userId }, msg[1], model[1])
        return [
          ['Party', modelPage],
          pipe(cmdPage, Cmd.map(tag("Party"))),
          actions
        ]
      }

      return [model, Cmd.None, []]
    }

    case "Login":
    case "Loading":
    case "ProfileCreate":
    case "LoginEmailPassword":
    case "AccountCreate":
    case "PasswordReset":
      return [model, Route.push(["GameRoom"]), []]

    default:
      return exhaustive(model)
  }
}

export const updateProfileMissing = (
  auth: Auth.Session,
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case "Logout":
      if (msg[0] === "Logout") {
        return tagUpdate(
          "Logout",
          Logout.update({ name: auth.defaultName }, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "ProfileCreate":
      if (msg[0] === "ProfileCreate") {
        return tagUpdate(
          "ProfileCreate",
          ProfileCreate.update(auth, msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]

    case "Account":
    case "Login":
    case "Profile":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Chat":
    case "ChatNew":
    case "ChatConversation":
    case "ProfileUpdateTheme":
    case "GameRoom":
    case "Loading":
    case "LoginEmailPassword":
    case "AccountCreate":
    case "PasswordReset":
    case "Search":
    case "Admin":
    case 'Party':
      return [model, Route.push(["ProfileCreate"]), []]

    default:
      return exhaustive(model)
  }
}

export const updateLoggedOut = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case "Login":
      if (msg[0] === "Login") {
        return tagUpdate("Login", Login.update(msg[1], model[1]))
      }
      return [model, Cmd.None, []]

    case "LoginEmailPassword":
      if (msg[0] === "LoginEmailPassword") {
        return tagUpdate("LoginEmailPassword", LoginEmailPassword.update(msg[1], model[1]))
      }
      return [model, Cmd.None, []]

    case "AccountCreate": {
      if (msg[0] === "AccountCreate") {
        return tagUpdate(
          "AccountCreate",
          AccountCreate.update(msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]
    }

    case "PasswordReset": {
      if (msg[0] === "PasswordReset") {
        return tagUpdate(
          "PasswordReset",
          PasswordReset.update(msg[1], model[1]),
        )
      }
      return [model, Cmd.None, []]
    }

    case "ProfileCreate":
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
    case "GameRoom":
    case "Loading":
    case "Logout":
    case "Profile":
    case "Admin":
    case "Search":
    case 'Party':
      return [model, Route.push(["Login"]), []]

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
  switch (model[0]) {
    case "ChatNew":
      return tagSub("ChatNew", ChatNew.subscriptions(model[1]))

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "Login":
    case "Logout":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateUsername":
    case "ProfileUpdateName":
    case "Loading":
    case "LoginEmailPassword":
    case "AccountCreate":
    case "PasswordReset":
    case "Profile":
    case "Search":
    case "Admin":
    case "GameRoom":
    case 'Party':
      return Sub.None

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

export const ViewReady = (
  {
    profile,
    gameRoom,
    store,
    route,
    party,
    model,
    dispatch,
  }: {
    route: Route.Model
    gameRoom: GameRoom.Model
    profile: Store.Profile.Profile
    store: Store.Model
    party: Party.Model,
    model: Model,
    dispatch: (msg: Msg) => void
  },
) => {
  const currentUserId = profile.userId
  switch (model[0]) {
    case "Account":
      return <UI.FillBox>
        <Account.View
          username={profile.username}
          model={model[1]}
          dispatch={msg => dispatch(['Account', msg])}
        />
      </UI.FillBox>

    case "Chat":
      return <UI.FillBox>
        <Chat.View
          profile={profile}
          model={model[1]}
          dispatch={msg => dispatch(['Chat', msg])}
          store={store}
        />
        <ViewBottomNavigation
          currentUserId={currentUserId}
          route={route}
          dispatch={dispatch}
        />
      </UI.FillBox>


    case "Search":
      return <UI.FillBox>
        <Search.View dispatch={msg => dispatch(['Search', msg])} model={model[1]} store={store} />

        <ViewBottomNavigation
          currentUserId={currentUserId}
          route={route}
          dispatch={dispatch}
        />
      </UI.FillBox>


    case "ChatNew":
      return <ChatNew.View store={store} currentUserProfile={profile} model={model[1]} dispatch={msg => dispatch(['ChatNew', msg])} />

    case "ChatConversation":
      return <ChatConversation.View store={store} authUser={profile} model={model[1]} dispatch={msg => dispatch(['ChatConversation', msg])} />

    case "Logout":
      return <Logout.View model={model[1]} dispatch={msg => dispatch(['Logout', msg])} />

    case "ProfileDelete":
      return <ProfileDelete.View store={store} profileId={profile.userId} model={model[1]} dispatch={msg => dispatch(['ProfileDelete', msg])} />

    case "ProfileUpdate":
      return <ProfileUpdate.View profile={profile} model={model[1]} dispatch={msg => dispatch(['ProfileUpdate', msg])} />

    case "ProfileUpdateAvatar":
      return <ProfileUpdateAvatar.View model={model[1]} dispatch={msg => dispatch(['ProfileUpdateAvatar', msg])} />

    case "ProfileUpdateName":
      return <ProfileUpdateName.View model={model[1]} dispatch={msg => dispatch(['ProfileUpdateName', msg])} />

    case "ProfileUpdateTheme":
      return <ProfileUpdateTheme.View profile={profile} model={model[1]} dispatch={msg => dispatch(['ProfileUpdateTheme', msg])} />

    case "ProfileUpdateUsername":
      return <ProfileUpdateUsername.View model={model[1]} dispatch={msg => dispatch(['ProfileUpdateUsername', msg])} />


    case "Admin":
      return <UI.LoadingPage />

    case "Profile":
      return (
        <UI.FillBox>
          <Profile.View
            store={store}
            currentUserId={profile.userId}
            model={model[1]}
            dispatch={msg => dispatch(['Profile', msg])}
          />
          <ViewBottomNavigation
            currentUserId={currentUserId}
            route={route}
            dispatch={dispatch}
          />
        </UI.FillBox>
      )

    case "GameRoom": {
      return (
        <UI.FillBox>
          <GameRoomPage.View
            store={store}
            currentUserId={currentUserId}
            gameRoom={gameRoom}
            model={model[1]}
            dispatch={msg => dispatch(['GameRoom', msg])}
          />
          <ViewBottomNavigation
            currentUserId={currentUserId}
            route={route}
            dispatch={dispatch}
          />
        </UI.FillBox>

      )

    }


    case 'Party': {
      return <UI.FillBox>
        <PartyPage.View
          currentUserId={currentUserId}
          party={party}
          store={store}
          model={model[1]}
          dispatch={(msg) => dispatch(['Party', msg])}
        />

        <ViewBottomNavigation
          currentUserId={currentUserId}
          route={route}
          dispatch={dispatch}
        />
      </UI.FillBox>

    }

    case "Login":
    case "ProfileCreate":
    case "Loading":
    case "LoginEmailPassword":
    case "PasswordReset":
    case "AccountCreate":
      return <UI.LoadingPage />

    default:
      return exhaustive(model)
  }
}

export const ViewProfileMissing = (
  {
    model,
    dispatch
  }: {
    authSession: Auth.Session,
    model: Model,
    dispatch: (msg: Msg) => void
  }
) => {
  switch (model[0]) {
    case "Logout":
      return <Logout.View model={model[1]} dispatch={msg => dispatch(['Logout', msg])} />

    case "ProfileCreate":
      return <ProfileCreate.View model={model[1]} dispatch={msg => dispatch(['ProfileCreate', msg])} />

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Login":
    case "LoginEmailPassword":
    case "Loading":
    case "Search":
    case "AccountCreate":
    case "PasswordReset":
    case "Profile":
    case "GameRoom":
    case "Admin":
    case 'Party':
      return <UI.LoadingPage />

    default:
      return exhaustive(model)
  }
}

export const ViewLoggedOut = ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) => {
  switch (model[0]) {
    case "Login":
      return <Login.View model={model[1]} dispatch={msg => dispatch(["Login", msg])} />

    case "LoginEmailPassword":
      return <LoginEmailPassword.View model={model[1]} dispatch={msg => dispatch(["LoginEmailPassword", msg])} />

    case "AccountCreate":
      return <AccountCreate.View model={model[1]} dispatch={msg => dispatch(["AccountCreate", msg])} />

    case "PasswordReset":
      return <PasswordReset.View model={model[1]} dispatch={msg => dispatch(["PasswordReset", msg])} />

    case "Account":
    case "Chat":
    case "ChatConversation":
    case "ChatNew":
    case "GameRoom":
    case "Logout":
    case "ProfileCreate":
    case "ProfileDelete":
    case "ProfileUpdate":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateTheme":
    case "ProfileUpdateName":
    case "ProfileUpdateUsername":
    case "Profile":
    case "Search":
    case "Admin":
    case "Loading":
    case 'Party':
      return <UI.LoadingPage />

    default:
      return exhaustive(model)
  }
}



//
//
//
//
//
//
//
//

type BottomNavigationItem = {
  route: Route.Model
  filled: UI.ViewNode
  outlined: UI.ViewNode
}

const ViewBottomNavigation =
  ({
    currentUserId,
    route,
    dispatch
  }: {
    currentUserId: UserId.UserId
    route: Route.Model,
    dispatch: (msg: Msg) => void
  }) => {
    const items: BottomNavigationItem[] = [
      {
        route: ["GameRoom"],
        filled: <UI.Icons.Gamepad />,
        outlined: <UI.Icons.GamepadOutlined />,
      },
      {
        route: ["Party"],
        filled: <UI.Icons.Group />,
        outlined: <UI.Icons.GroupOutlined />,
      },
      {
        route: ["Search"],
        filled: <UI.Icons.Search />,
        outlined: <UI.Icons.SearchOutlined />,
      },
      {
        route: ["Chat"],
        filled: <UI.Icons.Chat />,
        outlined: <UI.Icons.ChatOutlined />,
      },
      {
        route: ["Profile", currentUserId],
        filled: <UI.Icons.AccountCircle />,
        outlined: <UI.Icons.AccountCircleOutlined />,
      },
    ]

    const theme = UI.useTheme()

    return (
      <UI.Box sx={{ width: "100%", display: 'flex', alignItems: 'center', justifyContent: "center", height: 52 }}>
        {items.map((item) => (
          <UI.ButtonBase
            key={Route.encode(item.route)}
            sx={{ flex: 1, height: "100%", cursor: "pointer" }}
            onClick={() => dispatch(["ClickedBottomNavigationLink", item.route])}
          >
            {Route.equals(route, item.route) ?
              <UI.Box sx={{ color: theme.palette.primary.main }}>
                {item.filled}
              </UI.Box>
              :
              item.outlined
            }
          </UI.ButtonBase>
        ))}
      </UI.Box>
    )
  }

//
//
//
// Helpers
//
//
//

const tagUpdate = <TModel, TMsg, TAction, TPage extends Msg[0]>(
  page: TPage,
  [modelPrev, cmdPrev, actionsPrev = []]:
    | [TModel, Cmd.Cmd<TMsg>, TAction[]]
    | [TModel, Cmd.Cmd<TMsg>],
): [[TPage, TModel], Cmd.Cmd<[TPage, TMsg]>, TAction[]] => {
  return [[page, modelPrev], pipe(cmdPrev, Cmd.map(tag(page))), actionsPrev]
}
