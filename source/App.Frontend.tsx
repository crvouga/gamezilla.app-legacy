
import * as ReactDomClient from "react-dom/client"
import { io, Socket } from "socket.io-client"
import { FrontendModel, FrontendMsg, ToFrontend } from "./App.Types"
import * as Auth from "./Auth"
import * as Bridge from "./Bridge"
import {
  andThen,
  andThenMany,
  Browser,
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
import * as Store from "./Store"
import { toFindManyKey } from "./Store/Types"
import * as UI from "./UI"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

//
//
//
// Init
//
//
//

export const init = (location: Browser.Location): [Model, Cmd.Cmd<Msg>] => {
  const route = pipe(
    location,
    Route.decode,
    Option.withDefault<Route.Route>(["Home"]),
  )
  const [auth, authCmd] = Auth.init()
  const snackbar = Snackbar.init
  const store = Store.init
  const [gameRoom, gameRoomCmd] = GameRoom.init
  const [page, pageCmd] = Pages.initLoading()

  return [
    {
      route,
      snackbar,
      store,
      gameRoom,
      auth,
      page,
      backendConnection: "Connecting"
    },
    Cmd.batch<Msg>([
      tagCmd("Auth", authCmd),
      tagCmd("Page", pageCmd),
      tagCmd("GameRoom", gameRoomCmd),
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

export type Msg = FrontendMsg

type OutAction =
  | Snackbar.Action
  | GameRoom.Action
  | Store.Action
  | Auth.Action

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return pipe(
    [model, Cmd.None],
    andThen(updateMain, msg),
    andThen(updateStatusChanged(model), msg),
  )
}

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.update(msg[1], model.store)

      return [
        { ...model, store: storeNew },
        tagCmd("Store", storeCmd),
      ]
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

    case "GameRoom": {
      const status = toStatus(model)

      switch (status[0]) {
        case "ProfileLoading": 
        case "ProfileMissing": 
        case "AuthLoading": 
        case "LoggedOut": 
        case "ProfileError": {
          return [model, Cmd.None]
        }

        case "Ready": {
          const { profile } = status[1]

          const [child, childCmd] = GameRoom.update(
            { currentUserId: profile.userId },
            msg[1],
            model.gameRoom,
          )

          return pipe([
            { ...model, gameRoom: child },
            tagCmd("GameRoom", childCmd),
          ])
        }
      }
    }

    case "Page": {
      const status = toStatus(model)

      switch (status[0]) {
        case "AuthLoading":
          return [model, Cmd.None]

        case "ProfileLoading":
          return [model, Cmd.None]

        case "LoggedOut": {
          const [pageNew, pageCmd, actions] = Pages.updateLoggedOut(
            msg[1],
            model.page,
          )

          return pipe(
            [{ ...model, page: pageNew }, tagCmd("Page", pageCmd)],
            andThenMany(updateFromAction, actions),
          )
        }

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status[1].authSession,
            msg[1],
            model.page,
          )

          return pipe(
            [{ ...model, page: pageNew }, tagCmd("Page", pageCmd)],
            andThenMany(updateFromAction, actions),
          )
        }

        case "ProfileError":
          return [model, Cmd.None]

        case "Ready": {
          const [pageNew, pageCmd, actions] = Pages.updateReady(
            {
              ...model,
              profile: status[1].profile,
            },
            msg[1],
            model.page,
          )

          return pipe(
            [{ ...model, page: pageNew }, tagCmd("Page", pageCmd)],
            andThenMany(updateFromAction, actions),
          )
        }

        default:
          return exhaustive(status[0])
      }
    }

    case "Route": {
      const route = msg[1][1]

      const modelNew = { ...model, route }

      const status = toStatus(modelNew)

      switch (status[0]) {
        case "ProfileLoading":
        case "AuthLoading":
        case "ProfileError": {
          return [modelNew, Cmd.None]
        }

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(route, status[1].authSession)

          return [{ ...modelNew, page }, tagCmd("Page", pageCmd)]
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status[1].profile,
          )
          return pipe(
            [{ ...modelNew, page }, tagCmd("Page", pageCmd)],
            andThenMany(updateFromAction, actions),
          )
        }


        case "LoggedOut": {
          const [page, pageCmd] = Pages.initLoggedOut(route)

          return [{ ...modelNew, page }, tagCmd("Page", pageCmd)]
        }

        default:
          return exhaustive(status)
      }
    }

    case "BackendConnection.Changed": {
      const backendConnection = msg[1]
      return [
        { ...model, backendConnection },
        Cmd.None
      ]
    }

    case "[Backend]":
      return updateFromBackend(msg[1], model)

    default:
      return exhaustive(msg)
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "GameRoom": {
      const [gameRoom, gameRoomCmd, actions] = GameRoom.updateFromBackend(
        msg[1],
        model.gameRoom,
      )

      return pipe(
        [
          { ...model, gameRoom },
          tagCmd("GameRoom", gameRoomCmd),
        ],
        andThenMany(updateFromAction, actions),
      )
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

    switch (statusNew[0]) {
      case "ProfileError":
      case "AuthLoading": {
        return [model, Cmd.None]
      }

      case "ProfileLoading": {
        const action: OutAction = [
          "Store",
          ["Profile", ["FindMany", { userIds: [statusNew[1].authSession.userId] }]],
        ]

        return pipe([model, Cmd.None], andThenMany(updateFromAction, [action]))
      }

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew[1].authSession,
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
          statusNew[1].profile,
        )
        return pipe(
          [{ ...model, page }, tagCmd("Page", pageCmd)],
          andThenMany(updateFromAction, actions),
        )
      }

      default:
        return exhaustive(statusNew)
    }
  }

const updateFromAction = (action: OutAction, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.updateFromAction(action, model.store)
      return [
        { ...model, store: storeNew },
        tagCmd("Store", storeCmd),
      ]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.updateFromAction(
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

      const [gameRoom, gameRoomCmd] = GameRoom.updateFromAction(
        { currentUserId },
        action,
        model.gameRoom,
      )
      return [
        { ...model, gameRoom },
        tagCmd("GameRoom", gameRoomCmd),
      ]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.updateFromAction(action, model.auth)
      return [{ ...model, auth: authNew }, tagCmd("Auth", authCmd)]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    Bridge.onConnectionStatus(tag("BackendConnection.Changed")),
    Bridge.fromBackend(tag("[Backend]")),
    tagSub("Page", Pages.subscriptions(model.page)),
    tagSub("Auth", Auth.subscriptions),
    model.auth[0] === "LoggedIn"
      ?  tagSub("GameRoom", GameRoom.subscriptions(
        { currentUserId: model.auth[1].userId },
        model.gameRoom,
      ))
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

export const view =
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

  switch (model.backendConnection) {
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
          return (dispatch) => (
            <>
              {pipe(
                GameRoom.viewBanner(
                  { currentUserId: status[1].profile.userId, route: model.route },
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

export const onLocationChange = (location: Browser.Location): Msg => {
  return pipe(
    {pathname: location.pathname},
    Route.decode,
    Option.withDefault<Route.Route>(["Home"]),
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
  | ["AuthLoading" ] 
  | ["LoggedOut" ] 
  | ["ProfileLoading",  {authSession: Auth.Session }]
  | ["ProfileMissing",  {authSession: Auth.Session }]
  | ["ProfileError",  {authSession: Auth.Session }]
  | ["Ready",  {profile: Store.Profile.Profile; authSession: Auth.Session }]

export const toStatus = ({
  store,
  auth,
}: {
  store: Store.Model
  auth: Auth.Model
}): Status => {
  switch (auth[0]) {
    case "Loading":
      return ["AuthLoading" ]

    case "LoggedOut":
      return ["LoggedOut" ]

    case "LoggedIn": {
      const authSession = auth[1]

      const profile = store.Profile[authSession.userId]

      if (profile) {
        return ["Ready", {
          authSession,
          profile,
        }]
      }

      const key = toFindManyKey([authSession.userId])

      const query =
        store.queries.Profile.FindMany[key] ?? RemoteData.NotAsked

      switch (query.type) {
        case "NotAsked":
          return ["ProfileLoading", {authSession} ]

        case "Loading":
          return ["ProfileLoading", {authSession }]

        case "Failure":
          return ["ProfileError", {authSession }]

        case "Success": {
          const userIds = query.value

          const profiles = userIds
            .map(userId => store.Profile[userId])
            .flatMap(item => item ? [item] : [])

          const profile = profiles[0]

          if (!profile) {
            return  ["ProfileMissing", {authSession} ]
          }

          return ["Ready", {
            authSession,
            profile,
          }]
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



// 
// 
// 
// Socket
// 
// 
// 

const productionBackendUrl = "https://gamezilla.herokuapp.com/"

const developmentBackendUrl = `http://localhost:${Bridge.backendServerPort}/`

export const backendUrl =
  process.env.NODE_ENV === "production"
    ? productionBackendUrl
    : developmentBackendUrl

const socket: Socket<Bridge.ServerToClientEvents, Bridge.ClientToServerEvents> =
  io(backendUrl)


socket.on("connect", () => {
  Bridge._internal_connectionStatus.next("Connected")
})

socket.on("connect_error", () => {
  Bridge._internal_connectionStatus.next("ConnectError")
})

socket.on("disconnect", () => {
  Bridge._internal_connectionStatus.next("Disconnected")
})

socket.on("ToFrontend", (msg) => {
  Bridge._internal_toFrontend.next(msg)
})

Bridge._internal_sendToBackend.subscribe(msg => {
  socket.emit("ToBackend", msg)
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
