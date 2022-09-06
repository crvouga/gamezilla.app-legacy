import * as ReactDomClient from "react-dom/client"
import { io, Socket } from "socket.io-client"
import { FrontendModel, FrontendMsg, ToFrontend } from "./App.Types"
import * as Auth from "./Auth"
import * as Wire from "./Wire"
import {
  andThen,
  andThenMany,
  Browser,
  LocalStorage,
  Cmd,
  Debug,
  exhaustive,
  Option,
  pipe,
  RemoteData,
  Sub,
  tag,
  tagCmd,
  tagSub
} from "./Core"
import * as GameRoom from "./GameRoom/GameRoom.Frontend"
import * as Pages from "./Pages"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as Party from "./Party/Party.Frontend"
import * as Store from "./Store"
import * as UI from "./UI"

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

const init = (location: Browser.Location): [Model, Cmd.Cmd<Msg>] => {
  const route = pipe(
    location,
    Route.decode,
    Option.withDefault<Route.Model>(["Home"]),
  )
  const [auth, authCmd] = Auth.init()
  const snackbar = Snackbar.init
  const store = Store.init
  const [gameRoom, gameRoomCmd] = GameRoom.init
  const [page, pageCmd] = Pages.initLoading()
  const [party, partyCmd] = Party.init()

  return [
    {
      route,
      snackbar,
      store,
      gameRoom,
      auth,
      page,
      party,
      wire: "Connecting",
    },
    Cmd.batch<Msg>([
      tagCmd("Auth", authCmd),
      tagCmd("Page", pageCmd),
      tagCmd("GameRoom", gameRoomCmd),
      tagCmd("Party", partyCmd),
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
  | Store.Action
  | Auth.Action
  | Party.Action

//
//
//
// Update
//
//
//

const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return pipe(
    [model, Cmd.None],
    andThen(updateMain, msg),
    andThen(updateStatusChanged(model), msg),
  )
}

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "▶": {
      return updateFromBackend(msg[1], model)
    }

    case "Store": {
      const [storeNew, storeCmd] = Store.update(msg[1], model.store)

      return [{ ...model, store: storeNew }, tagCmd("Store", storeCmd)]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.update(msg[1], model.auth)

      return [{ ...model, auth: authNew }, tagCmd("Auth", authCmd)]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg[1], model.snackbar)

      return [
        { ...model, snackbar: snackbarNew },
        tagCmd("Snackbar", snackbarCmd),
      ]
    }


    case 'Party': {
      const [child, childCmd] = Party.update({ sendToBackend: (msg) => Wire.sendToBackend(['Party', msg]) }, msg[1], model.party)
      return [{ ...model, party: child }, tagCmd("Party", childCmd)]
    }

    case "Route": {
      switch (msg[1][0]) {
        case 'GotRoute': {
          const modelNew: Model = {
            ...model,
            route: msg[1][1]
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

    case 'LocalStoragePut_Done': {
      return [model, Cmd.None]
    }

    case "GameRoom": {
      const status = toStatus(model)

      if (status[0] !== 'Ready') {
        return [model, Cmd.None]
      }

      const { profile } = status[1]

      const [child, childCmd] = GameRoom.update(
        {
          currentUserId: profile.userId,
          sendToBackend: msg => Wire.sendToBackend(['GameRoom', msg])
        },
        msg[1],
        model.gameRoom,
      )

      return pipe([
        { ...model, gameRoom: child },
        tagCmd("GameRoom", childCmd),
      ])
    }

    case "Page": {
      const [modelNew, cmd, actions] = updatePage(msg[1], model)
      return pipe([modelNew, cmd], andThenMany(runAction, actions))
    }

    default:
      return exhaustive(msg)
  }
}

const updatePage = (msg: Pages.Msg, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  const status = toStatus(model)

  switch (status[0]) {
    case "AuthLoading":
    case "ProfileError":
    case "ProfileLoading":
      return [model, Cmd.None, []]

    case "LoggedOut": {
      const [pageNew, pageCmd, actions] = Pages.updateLoggedOut(
        msg,
        model.page,
      )

      return [{ ...model, page: pageNew }, tagCmd("Page", pageCmd), actions]
    }

    case "ProfileMissing": {
      const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
        status[1].authSession,
        msg,
        model.page,
      )

      return [{ ...model, page: pageNew }, tagCmd("Page", pageCmd), actions]
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
      return [{ ...model, page: pageNew }, tagCmd("Page", pageCmd), actions]
    }

    default:
      return exhaustive(status[0])
  }
}

const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {

    case 'Session': {
      const sessionId = msg[1]

      return [model, LocalStorage.put(Wire.sessionIdKey, sessionId, tag("LocalStoragePut_Done"))]
    }

    case 'Party': {
      if (model.auth[0] !== 'LoggedIn') {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth[1].userId

      const [party, partyCmd, actions] = Party.updateFromBackend({ currentUserId }, msg[1], model.party)

      return pipe(
        [{ ...model, party }, tagCmd("Party", partyCmd)],
        andThenMany(runAction, actions)
      )
    }

    case "GameRoom": {
      const [gameRoom, gameRoomCmd, actions] = GameRoom.updateFromBackend(
        { sendToBackend: msg => Wire.sendToBackend(['GameRoom', msg]) },
        msg[1],
        model.gameRoom,
      )

      return pipe(
        [{ ...model, gameRoom }, tagCmd("GameRoom", gameRoomCmd)],
        andThenMany(runAction, actions),
      )
    }
  }
}

const initPage = (model: Model): [Model, Cmd.Cmd<Msg>] => {
  const status = toStatus(model)

  switch (status[0]) {
    case "ProfileError": {
      return [model, Cmd.None]
    }

    case "AuthLoading": {
      return [model, Cmd.None]
    }

    case "ProfileLoading": {
      const action: OutAction = [
        "Store",
        [
          "Profile",
          ["FindMany", { userIds: [status[1].authSession.userId] }],
        ],
      ]

      return pipe([model, Cmd.None], andThenMany(runAction, [action]))
    }

    case "ProfileMissing": {
      const [page, pageCmd] = Pages.initProfileMissing(
        model.route,
        status[1].authSession,
      )

      return [{ ...model, page }, tagCmd("Page", pageCmd)]
    }

    case "LoggedOut": {
      const [page, pageCmd] = Pages.initLoggedOut(model.route)
      return [{ ...model, page }, tagCmd("Page", pageCmd)]
    }

    case "Ready": {
      const [page, pageCmd, actions] = Pages.initReady(
        model.route,
        status[1].profile,
      )
      return pipe(
        [{ ...model, page }, tagCmd("Page", pageCmd)],
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
    (_msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
      const statusPrev = toStatus(modelPrev)
      const statusNew = toStatus(model)

      if (statusNew[0] === statusPrev[0]) {
        return [model, Cmd.None]
      }

      return initPage(model)
    }

const runAction = (
  action: OutAction,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.runAction(action, model.store)
      return [{ ...model, store: storeNew }, tagCmd("Store", storeCmd)]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action,
        model.snackbar,
      )
      return [
        { ...model, snackbar: snackbarNew },
        tagCmd("Snackbar", snackbarCmd),
      ]
    }

    case "GameRoom": {
      if (model.auth[0] !== "LoggedIn") {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth[1].userId

      const [gameRoom, gameRoomCmd] = GameRoom.runAction(
        { currentUserId, sendToBackend: msg => Wire.sendToBackend(['GameRoom', msg]) },
        action,
        model.gameRoom,
      )
      return [{ ...model, gameRoom }, tagCmd("GameRoom", gameRoomCmd)]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.runAction(action, model.auth)
      return [{ ...model, auth: authNew }, tagCmd("Auth", authCmd)]
    }

    case 'Party': {
      const [party, partyCmd] = Party.runAction({ sendToBackend: (msg) => Wire.sendToBackend(['Party', msg]) }, action, model.party)
      return [{ ...model, party }, tagCmd("Party", partyCmd)]
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

const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    Wire.onConnectionStatus(tag("Wire")),
    Wire.fromBackend(tag("▶")),
    tagSub("Party", Party.subscriptions(model.party)),
    tagSub("Page", Pages.subscriptions(model.page)),
    tagSub("Auth", Auth.subscriptions),
    model.auth[0] === "LoggedIn"
      ? tagSub(
        "GameRoom",
        GameRoom.subscriptions(
          { currentUserId: model.auth[1].userId },
          model.gameRoom,
        ),
      )
      : Sub.None,
  ])
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

const view =
  (model: Model): UI.View<Msg> =>
    (dispatch) => {
      return (
        <UI.ThemeProvider themeMode={toThemeMode(model)}>
          <UI.Box
            sx={{
              userSelect: "none",
              maxWidth: "sm",
              marginX: "auto",
              position: "fixed",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <UI.Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {viewMain(model)(dispatch)}
            </UI.Box>

            {pipe(
              Snackbar.view({}, model.snackbar),
              UI.map(tag("Snackbar")),
            )(dispatch)}
          </UI.Box>
        </UI.ThemeProvider>
      )
    }

const viewMain = (model: Model): UI.View<Msg> => {
  const status = toStatus(model)

  switch (model.wire) {
    case "Connecting":
      return viewLoading({ reason: "Connecting..." })

    case "Disconnected":
      return viewLoading({ reason: "Connecting..." })

    case "ConnectError":
      return viewLoading({ reason: "Connecting..." })

    case "Connected": {
      switch (status[0]) {
        case "AuthLoading":
          return viewLoading({ reason: "Authenticating..." })

        case "ProfileLoading":
          return viewLoading({ reason: "Loading profile..." })

        case "ProfileError":
          return viewError({ reason: "Failed to load profile." })

        case "LoggedOut":
          return pipe(Pages.viewLoggedOut(model.page), UI.map(tag("Page")))

        case "ProfileMissing":
          return pipe(
            Pages.viewProfileMissing(status[1].authSession, model.page),
            UI.map(tag("Page")),
          )

        case "Ready":
          const currentUserId = status[1].profile.userId
          return (dispatch) => (
            <>

              {pipe(
                Party.viewBanner(
                  {
                    store: model.store,
                    route: model.route,
                    currentUserId,
                    model: model.party,
                  }
                ),
                UI.map(tag("Party")),
              )(dispatch)}

              {pipe(
                GameRoom.viewBanner(
                  {
                    currentUserId,
                    route: model.route,
                  },
                  model.gameRoom,
                ),
                UI.map(tag("GameRoom")),
              )(dispatch)}

              <UI.FillBox>
                {pipe(
                  Pages.viewReady(
                    { ...model, profile: status[1].profile },
                    model.page,
                  ),
                  UI.map(tag("Page")),
                )(dispatch)}
              </UI.FillBox>
            </>
          )
      }
    }
  }
}

const viewLoading =
  ({ reason }: { reason: string }): UI.View<Msg> =>
    () =>
    (
      <UI.FillBox sx={{ justifyContent: "center", alignItems: "center" }}>
        <UI.CircularProgress sx={{ marginBottom: 2 }} />

        <UI.Typography
          align="center"
          variant="caption"
          color="text.secondary"
        >
          {reason}
        </UI.Typography>
      </UI.FillBox>
    )

const viewError =
  ({ reason }: { reason: string }): UI.View<Msg> =>
    () =>
    (
      <UI.FillBox sx={{ justifyContent: "center", alignItems: "center", p: 2 }}>
        <UI.Alert severity="error">{reason}</UI.Alert>
      </UI.FillBox>
    )

//
//
//
// Location
//
//
//

const onLocationChange = (location: Browser.Location): Msg => {
  return pipe(
    { pathname: location.pathname },
    Route.decode,
    Option.withDefault<Route.Model>(["Home"]),
    (route) => ["Route", ["GotRoute", route]],
  )
}

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
  | ["Ready", { profile: Store.Profile.Profile; authSession: Auth.Session }]

const toStatus = ({
  store,
  auth,
}: {
  store: Store.Model
  auth: Auth.Model
}): Status => {
  switch (auth[0]) {
    case "Loading":
      return ["AuthLoading"]

    case "LoggedOut":
      return ["LoggedOut"]

    case "LoggedIn": {
      const authSession = auth[1]

      const profile = store.Profile[authSession.userId]

      if (profile) {
        return [
          "Ready",
          {
            authSession,
            profile,
          },
        ]
      }

      const key = Store.Types.toFindManyKey([authSession.userId])

      const query = store.queries.Profile.FindMany[key] ?? RemoteData.NotAsked

      switch (query.type) {
        case "NotAsked":
          return ["ProfileLoading", { authSession }]

        case "Loading":
          return ["ProfileLoading", { authSession }]

        case "Failure":
          return ["ProfileError", { authSession }]

        case "Success": {
          const userIds = query.value

          const profiles = userIds
            .map((userId) => store.Profile[userId])
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
// Main
//
//
//

const program = pipe(
  Browser.application({
    init,
    onLocationChange,
    subscriptions,
    update,
    view,
  }),
  Debug.ReduxDevTools.withDebugger,
)

const root = ReactDomClient.createRoot(document.getElementById("root")!)

Browser.run(program, (dom) => {
  root.render(dom)
})

// program.state$.subscribe((state) => {
//   console.log("--")
//   console.log(state.msg?.flat(Infinity))
//   console.log(state.model)
// })

//
//
//
// Socket
//
//
//

const productionBackendUrl = "https://backend.gamezilla.app/"

const developmentBackendUrl = `http://localhost:${Wire.backendServerPort}/`

const backendUrl =
  process.env.NODE_ENV === "production"
    ? productionBackendUrl
    : developmentBackendUrl

const socketClient: Socket<Wire.ServerToClientEvents, Wire.ClientToServerEvents> =
  io(backendUrl, {
    auth: {
      [Wire.sessionIdKey]: localStorage.getItem(Wire.sessionIdKey) ?? undefined
    }
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
// Hot Reload
//
//
//

// const dispose = () => {
//   stop()
// }

// // @ts-ignore
// if (import.meta.hot) {
//   // @ts-ignore
//   import.meta.hot.accept()
//   // @ts-ignore
//   import.meta.hot.dispose(dispose)
// }
