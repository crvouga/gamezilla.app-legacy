import * as ReactDomClient from "react-dom/client"
import { io, Socket } from "socket.io-client"
import { FrontendModel, FrontendMsg, ToFrontend } from "./App.Types"
import * as Auth from "./Auth/Auth"
import * as ChatStore from "./Chat/Chat.Store"
import {
  andThen,
  andThenMany,
  Browser,
  Cmd,
  Debug,
  exhaustive,
  LocalStorage,
  Option,
  p,
  Platform,
  RemoteData,
  Sub,
  t,
  tagSub
} from "./Core"
import * as GameRoom from "./Game/GameRoom.Frontend"
import * as Pages from "./Pages"
import * as Party from "./Party/Party.Frontend"
import * as ProfileStore from './Profile/Profile.Store'
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as UI from "./UI"
import * as Wire from "./Wire"

//
//
//
// Model
//
//
//

type Model = FrontendModel

//
//
//
// Init
//
//
//

const init = (location: Browser.Location): [Model, Cmd<Msg>] => {
  const route = p(
    location,
    Route.decode,
    Option.withDefault<Route.Model>(["GameRoom"]),
  )
  const [auth, authCmd] = Auth.init()
  const snackbar = Snackbar.init
  const store = ChatStore.init
  const [gameRoom, gameRoomCmd] = GameRoom.init
  const [page, pageCmd] = Pages.initLoading()
  const [party, partyCmd] = Party.init({ sendToBackend: msg => Wire.sendToBackend(['Party', msg]) });
  const profileStore = ProfileStore.init

  return [
    {
      route,
      snackbar,
      chatStore: store,
      gameRoom,
      auth,
      page,
      party,
      profileStore,
      wire: "Connecting",
    },
    Cmd.batch<Msg>([
      Cmd.tag("Auth", authCmd),
      Cmd.tag("Page", pageCmd),
      Cmd.tag("GameRoom", gameRoomCmd),
      Cmd.tag("Party", partyCmd),
    ]),
  ]
}

//
//
//
// Msg
//
//
//

type Msg = FrontendMsg

type OutAction =
  | Snackbar.Action
  | GameRoom.Action
  | ChatStore.Action
  | Auth.Action
  | Party.Action
  | Route.Action
  | ProfileStore.Action

//
//
//
// Update
//
//
//

const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  return p(
    [model, Cmd.None],
    andThen(updateMain, msg),
    andThen(updateStatusChanged(model), msg),
  )
}

const updateMain = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "▶": {
      return updateFromBackend(msg[1], model)
    }

    case "Store": {
      const [storeNew, storeCmd] = ChatStore.update(msg[1], model.chatStore)

      return [{ ...model, chatStore: storeNew }, Cmd.tag("Store", storeCmd)]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.update(
        { sendToBackend: (msg) => Wire.sendToBackend(["Auth", msg]) },
        msg[1],
        model.auth,
      )

      return [{ ...model, auth: authNew }, Cmd.tag("Auth", authCmd)]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg[1], model.snackbar)

      return [
        { ...model, snackbar: snackbarNew },
        Cmd.tag("Snackbar", snackbarCmd),
      ]
    }

    case "Party": {
      const [child, childCmd] = Party.update(
        { sendToBackend: (msg) => Wire.sendToBackend(["Party", msg]) },
        msg[1],
        model.party,
      )
      return [{ ...model, party: child }, Cmd.tag("Party", childCmd)]
    }

    case "Route": {
      switch (msg[1][0]) {
        case "GotRoute": {
          const modelNew: Model = {
            ...model,
            route: msg[1][1],
          }

          return initPage(modelNew)
        }

        default: {
          return exhaustive(msg[1][0])
        }
      }
    }

    case "Wire": {
      return [{ ...model, wire: msg[1] }, Cmd.None]
    }

    case "LocalStoragePut_Done": {
      return [model, Cmd.None]
    }

    case "GameRoom": {
      const status = toStatus(model)

      if (status[0] !== "Ready") {
        return [model, Cmd.None]
      }

      const { profile } = status[1]

      const [child, childCmd] = GameRoom.update(
        {
          currentUserId: profile.userId,
          sendToBackend: (msg) => Wire.sendToBackend(["GameRoom", msg]),
        },
        msg[1],
        model.gameRoom,
      )

      return p([{ ...model, gameRoom: child }, Cmd.tag("GameRoom", childCmd)])
    }

    case "Page": {
      const [modelNew, cmd, actions] = updatePage(msg[1], model)
      return p([modelNew, cmd], andThenMany(runAction, actions))
    }

    case 'ProfileStore': {
      const [modelNew, cmd] = ProfileStore.update(msg[1], model.profileStore)
      return [{ ...model, profileStore: modelNew }, Cmd.tag("ProfileStore", cmd)]
    }

    default:
      return exhaustive(msg)
  }
}

const updatePage = (
  msg: Pages.Msg,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  const status = toStatus(model)

  switch (status[0]) {
    case "AuthLoading":
    case "ProfileError":
    case "ProfileLoading":
      return [model, Cmd.None, []]

    case "LoggedOut": {
      const [pageNew, pageCmd, actions] = Pages.updateLoggedOut(msg, model.page)

      return [{ ...model, page: pageNew }, Cmd.tag("Page", pageCmd), actions]
    }

    case "ProfileMissing": {
      const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
        status[1].authSession,
        msg,
        model.page,
      )

      return [{ ...model, page: pageNew }, Cmd.tag("Page", pageCmd), actions]
    }

    case "Ready": {
      const [pageNew, pageCmd, actions] = Pages.updateReady(
        {
          ...model,
          profile: status[1].profile,
        },
        msg,
        model.page,
      )
      return [{ ...model, page: pageNew }, Cmd.tag("Page", pageCmd), actions]
    }

    default:
      return exhaustive(status[0])
  }
}

const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Session": {
      const sessionId = msg[1]

      return [
        model,
        LocalStorage.put(
          Wire.sessionIdKey,
          sessionId,
          t("LocalStoragePut_Done"),
        ),
      ]
    }

    case "Party": {
      if (model.auth[0] !== "LoggedIn") {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth[1].userId

      const [party, partyCmd, actions] = Party.updateFromBackend(
        { currentUserId },
        msg[1],
        model.party,
      )

      return p(
        [{ ...model, party }, Cmd.tag("Party", partyCmd)],
        andThenMany(runAction, actions),
      )
    }

    case "GameRoom": {
      if (model.auth[0] !== "LoggedIn") {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth[1].userId

      const [gameRoom, gameRoomCmd, actions] = GameRoom.updateFromBackend(
        {
          currentUserId,
          sendToBackend: (msg) => Wire.sendToBackend(["GameRoom", msg]),
          profileStore: model.profileStore,
        },
        msg[1],
        model.gameRoom,
      )

      return p(
        [{ ...model, gameRoom }, Cmd.tag("GameRoom", gameRoomCmd)],
        andThenMany(runAction, actions),
      )
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const initPage = (model: Model): [Model, Cmd<Msg>] => {
  const status = toStatus(model)

  switch (status[0]) {
    case "ProfileError": {
      return [model, Cmd.None]
    }

    case "AuthLoading": {
      return [model, Cmd.None]
    }

    case "ProfileLoading": {
      const action: OutAction =
        ["Profile", ["FindMany", { userIds: [status[1].authSession.userId] }]]

      return p([model, Cmd.None], andThenMany(runAction, [action]))
    }

    case "ProfileMissing": {
      const [page, pageCmd] = Pages.initProfileMissing(
        model.route,
        status[1].authSession,
      )

      return [{ ...model, page }, Cmd.tag("Page", pageCmd)]
    }

    case "LoggedOut": {
      const [page, pageCmd] = Pages.initLoggedOut(model.route)
      return [{ ...model, page }, Cmd.tag("Page", pageCmd)]
    }

    case "Ready": {
      const [page, pageCmd, actions] = Pages.initReady(
        model.route,
        status[1].profile,
      )
      return p(
        [{ ...model, page }, Cmd.tag("Page", pageCmd)],
        andThenMany(runAction, actions),
      )
    }

    default: {
      return exhaustive(status)
    }
  }
}

const updateStatusChanged =
  (modelPrev: Model) =>
    (_msg: Msg, model: Model): [Model, Cmd<Msg>] => {
      const statusPrev = toStatus(modelPrev)
      const statusNew = toStatus(model)

      if (statusNew[0] === statusPrev[0]) {
        return [model, Cmd.None]
      }

      return initPage(model)
    }

const runAction = (action: OutAction, model: Model): [Model, Cmd<Msg>] => {
  switch (action[0]) {
    case "Chat": {
      const [chatNew, chatCmd] = ChatStore.runAction(action, model.chatStore)
      return [{ ...model, chatStore: chatNew }, Cmd.tag("Store", chatCmd)]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action,
        model.snackbar,
      )
      return [
        { ...model, snackbar: snackbarNew },
        Cmd.tag("Snackbar", snackbarCmd),
      ]
    }

    case "GameRoom": {
      if (model.auth[0] !== "LoggedIn") {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth[1].userId

      const [gameRoom, gameRoomCmd] = GameRoom.runAction(
        {
          currentUserId,
          sendToBackend: (msg) => Wire.sendToBackend(["GameRoom", msg]),
        },
        action,
        model.gameRoom,
      )
      return [{ ...model, gameRoom }, Cmd.tag("GameRoom", gameRoomCmd)]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.runAction(action, model.auth)
      return [{ ...model, auth: authNew }, Cmd.tag("Auth", authCmd)]
    }

    case "Party": {
      const [party, partyCmd] = Party.runAction(
        { sendToBackend: (msg) => Wire.sendToBackend(["Party", msg]) },
        action,
        model.party,
      )
      return [{ ...model, party }, Cmd.tag("Party", partyCmd)]
    }

    case "Route": {
      const [route, routeCmd] = Route.runAction(action, model.route)

      return [{ ...model, route }, Cmd.tag("Route", routeCmd)]
    }

    case 'Profile': {
      const [profileStore, profileStoreCmd] = ProfileStore.runAction(action, model.profileStore)
      return [{ ...model, profileStore, }, Cmd.tag("ProfileStore", profileStoreCmd)]
    }

    default:
      return exhaustive(action[0])
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions = (model: Model): Sub<Msg> => {
  return Sub.batch<Msg>([
    Wire.onConnectionStatus(t("Wire")),
    Wire.fromBackend(t("▶")),
    Browser.onLocation(onLocationChange),
    Sub.tag("Party", Party.subscriptions(model.party)),
    Sub.tag("Page", Pages.subscriptions(model.page)),
    Sub.tag("Auth", Auth.subscriptions),
    gameRoomSub(model),
  ])
}

const gameRoomSub = (model: Model): Sub<Msg> => {
  switch (model.auth[0]) {
    case "Loading": {
      return Sub.None
    }

    case "LoggedOut": {
      return Sub.None
    }

    case "LoggedIn": {
      return Sub.tag(
        "GameRoom",
        GameRoom.subscriptions(
          { currentUserId: model.auth[1].userId },
          model.gameRoom,
        ),
      )
    }
  }
}

const onLocationChange = (location: Browser.Location): Msg => {
  return p(
    location,
    Route.decode,
    Option.withDefault<Route.Model>(["GameRoom"]),
    (route) => ["Route", ["GotRoute", route]],
  )
}

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): UI.ThemeMode => {
  const status = toStatus(model)

  switch (status[0]) {
    case "AuthLoading":
    case "LoggedOut":
    case "ProfileLoading":
    case "ProfileMissing":
    case "ProfileError":
      return "System"
    case "Ready":
      return status[1].profile.themeMode
  }
}

const View = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.AppContainer themeMode={toThemeMode(model)}>
      <UI.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
          flex: 1,
        }}
      >
        <ViewMain
          model={model}
          dispatch={dispatch}
        />
      </UI.Box>

      <Snackbar.View
        model={model.snackbar}
        dispatch={(msg) => dispatch(["Snackbar", msg])}
      />
    </UI.AppContainer>
  )
}

const ViewMain = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const status = toStatus(model)

  switch (model.wire) {
    case "Connecting":
    case "Disconnected":
    case "ConnectError":
      return <ViewLoading reason="Connecting to backend..." />

    case "Connected": {
      switch (status[0]) {
        case "AuthLoading":
          return <ViewLoading reason="Authenticating..." />

        case "ProfileLoading":
          return <ViewLoading reason="Loading your profile..." />

        case "ProfileError":
          return <ViewError reason="Failed to load profile." />

        case "LoggedOut":
          return (
            <Pages.ViewLoggedOut
              model={model.page}
              dispatch={(msg) => dispatch(["Page", msg])}
            />
          )

        case "ProfileMissing":
          return (
            <Pages.ViewProfileMissing
              authSession={status[1].authSession}
              model={model.page}
              dispatch={(msg) => dispatch(["Page", msg])}
            />
          )

        case "Ready":
          const { profile } = status[1]
          return (
            <>
              <Party.ViewBanner
                store={model.profileStore}
                currentUserId={profile.userId}
                model={model.party}
                route={model.route}
                dispatch={(msg) => dispatch(["Party", msg])}
              />

              <GameRoom.ViewBanner
                store={model.profileStore}
                currentUserId={profile.userId}
                model={model.gameRoom}
                route={model.route}
                dispatch={(msg) => dispatch(["GameRoom", msg])}
              />

              <Pages.ViewReady
                {...model}
                profile={status[1].profile}
                dispatch={(msg) => dispatch(["Page", msg])}
                model={model.page}
              />
            </>
          )
      }
    }
  }
}

const ViewLoading = ({ reason }: { reason: string }) => (
  <UI.FillBox sx={{ justifyContent: "center", alignItems: "center" }}>
    <UI.CircularProgress sx={{ marginBottom: 2 }} />

    <UI.Typography
      sx={{ position: "absolute", bottom: 0, left: 0, padding: 1 }}
      align="center"
      variant="caption"
      color="text.secondary"
    >
      {reason}
    </UI.Typography>
  </UI.FillBox>
)

const ViewError = ({ reason }: { reason: string }) => (
  <UI.FillBox sx={{ justifyContent: "center", alignItems: "center", p: 2 }}>
    <UI.Alert severity="error">{reason}</UI.Alert>
  </UI.FillBox>
)

//
//
//
// Status
//
//
//

type Status =
  | ["AuthLoading"]
  | ["LoggedOut"]
  | ["ProfileLoading", { authSession: Auth.Session }]
  | ["ProfileMissing", { authSession: Auth.Session }]
  | ["ProfileError", { authSession: Auth.Session }]
  | ["Ready", { profile: ProfileStore.Profile; authSession: Auth.Session }]

const toStatus = ({
  auth,
  profileStore,
}: {
  profileStore: ProfileStore.Model
  auth: Auth.Model
}): Status => {
  switch (auth[0]) {
    case "Loading":
      return ["AuthLoading"]

    case "LoggedOut":
      return ["LoggedOut"]

    case "LoggedIn": {
      const authSession = auth[1]

      const profile = profileStore.profiles[authSession.userId]

      if (profile) {
        return [
          "Ready",
          {
            authSession,
            profile,
          },
        ]
      }

      const key = ProfileStore.toFindManyKey([authSession.userId])

      const query = profileStore.findMany[key] ?? RemoteData.NotAsked

      switch (query.type) {
        case "NotAsked":
          return ["ProfileLoading", { authSession }]

        case "Loading":
          return ["ProfileLoading", { authSession }]

        case "Err":
          return ["ProfileError", { authSession }]

        case "Ok": {
          const userIds = query.value

          const profiles = userIds
            .map((userId) => profileStore.profiles[userId])
            .flatMap((item) => (item ? [item] : []))

          const profile = profiles[0]

          if (!profile) {
            return ["ProfileMissing", { authSession }]
          }

          return [
            "Ready",
            {
              authSession,
              profile,
            },
          ]
        }
      }
    }
  }
}

//
//
//
// Socket
//
//
//

const backendUrl =
  // todo remove this
  // @ts-ignore
  import.meta.env.PROD
    ? "https://backend.gamezilla.app/"
    : `http://localhost:${Wire.backendServerPort}/`

const socketClient: Socket<
  Wire.ServerToClientEvents,
  Wire.ClientToServerEvents
> = io(backendUrl, {
  auth: {
    [Wire.sessionIdKey]: localStorage.getItem(Wire.sessionIdKey) ?? undefined,
  },
  forceNew: true,
})

socketClient.on("connect", () => {
  Wire._connectionStatus.next("Connected")
})

socketClient.on("connect_error", () => {
  Wire._connectionStatus.next("ConnectError")
})

socketClient.on("disconnect", () => {
  Wire._connectionStatus.next("Disconnected")
})

socketClient.on("ToFrontend", (msg) => {
  Wire._toFrontend.next(msg)
})

Wire._sendToBackend.subscribe((msg) => {
  socketClient.emit("ToBackend", msg)
})

//
//
//
// Main
//
//
//

const { program } = Debug.ReduxDevTools.withDebugger(
  Platform.createProgram({
    init: init(Browser.getLocation()),
    subscriptions,
    update,
  }),
)

const root = ReactDomClient.createRoot(document.getElementById("root")!)

program.sub$.subscribe((msg) => {
  program.dispatch(msg)
})

program.state$.subscribe(({ model, cmd }) => {
  cmd(program.dispatch)
  root.render(
    <View
      model={model}
      dispatch={program.dispatch}
    />,
  )
})

//
//
//
// HMR
//
//
//

export const exporting_so_HMR_is_disabled = {}
