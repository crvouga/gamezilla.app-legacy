import * as ReactDomClient from "react-dom/client"
import * as Auth from "./Auth"
import { fromBackend } from "./Bridge/Frontend"
import * as Connection from "./Connection"
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
} from "./Core"
import * as GameRoom from "./GameRoom"
import * as Pages from "./Pages"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as Store from "./Store"
import * as Profile from "./Store/Profile"
import { FrontendModel, FrontendMsg, ToFrontend } from "./Types"
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
// Status
//
//
//

type Status =
  | { type: "AuthLoading" }
  | { type: "LoggedOut" }
  | { type: "ProfileLoading"; auth: Auth.LoggedIn }
  | { type: "ProfileMissing"; auth: Auth.LoggedIn }
  | { type: "ProfileError"; auth: Auth.LoggedIn }
  | { type: "Ready"; profile: Profile.Profile; auth: Auth.LoggedIn }

export const toStatus = ({
  store,
  auth,
}: {
  store: Store.Model
  auth: Auth.Model
}): Status => {
  switch (auth.type) {
    case "Loading":
      return { type: "AuthLoading" }

    case "LoggedOut":
      return { type: "LoggedOut" }

    case "LoggedIn": {
      const { userId } = auth

      const profile = store.Profile[userId]

      if (profile) {
        return {
          type: "Ready",
          auth,
          profile,
        }
      }

      const query =
        store.queries.Profile.FindOne[auth.userId] ?? RemoteData.NotAsked

      switch (query.type) {
        case "NotAsked":
          return { type: "ProfileLoading", auth }

        case "Loading":
          return { type: "ProfileLoading", auth }

        case "Failure":
          return { type: "ProfileError", auth }

        case "Success": {
          const userId = query.value

          const profile = store.Profile[userId]

          if (!profile) {
            return { type: "ProfileMissing", auth }
          }

          return {
            type: "Ready",
            auth,
            profile,
          }
        }
      }
    }
  }
}

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
    Option.withDefault<Route.Route>({ type: "Home" }),
  )
  const [auth, authCmd] = Auth.init()
  const snackbar = Snackbar.init
  const store = Store.init
  const [gameRoom, gameRoomCmd] = GameRoom.Frontend.init
  const [page, pageCmd] = Pages.initLoading()
  const connection = Connection.init

  return [
    {
      route,
      snackbar,
      store,
      gameRoom,
      auth,
      page,
      connection,
    },
    Cmd.batch<Msg>([
      pipe(authCmd, Cmd.map(tag("Auth"))),
      pipe(pageCmd, Cmd.map(tag("Page"))),
      pipe(gameRoomCmd, Cmd.map(tag("GameRoom"))),
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
  | GameRoom.Frontend.Action
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

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "GameRoom": {
      const [child, childCmd, actions] = GameRoom.Frontend.updateFromBackend(
        msg[1],
        model.gameRoom,
      )

      return pipe(
        [
          { ...model, gameRoom: child },
          pipe(childCmd, Cmd.map(tag("GameRoom"))),
        ],
        andThenMany(runAction, actions),
      )
    }
  }
}

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.update(msg[1], model.store)

      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(tag("Store"))),
      ]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.update(msg[1], model.auth)

      return [{ ...model, auth: authNew }, pipe(authCmd, Cmd.map(tag("Auth")))]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg[1], model.snackbar)

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(tag("Snackbar"))),
      ]
    }

    case "GameRoom": {
      const status = toStatus(model)

      switch (status.type) {
        case "ProfileLoading": {
          return [model, Cmd.None]
        }

        case "ProfileMissing": {
          return [model, Cmd.None]
        }

        case "AuthLoading": {
          return [model, Cmd.None]
        }

        case "LoggedOut": {
          return [model, Cmd.None]
        }

        case "ProfileError": {
          return [model, Cmd.None]
        }

        case "Ready": {
          const { profile } = status

          const [child, childCmd] = GameRoom.Frontend.update(
            { currentUserId: profile.userId },
            msg[1],
            model.gameRoom,
          )

          return pipe([
            { ...model, gameRoom: child },
            pipe(childCmd, Cmd.map(tag("GameRoom"))),
          ])
        }
      }
    }

    case "Page": {
      const status = toStatus(model)

      switch (status.type) {
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
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          )
        }

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.auth,
            msg[1],
            model.page,
          )

          return pipe(
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          )
        }

        case "ProfileError":
          return [model, Cmd.None]

        case "Ready": {
          const [pageNew, pageCmd, actions] = Pages.updateReady(
            {
              profile: status.profile,
              store: model.store,
              gameRoom: model.gameRoom,
            },
            msg[1],
            model.page,
          )

          return pipe(
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          )
        }

        default:
          return exhaustive(status)
      }
    }

    case "Route": {
      const route = msg[1][1]

      const modelNew = { ...model, route }

      const status = toStatus(modelNew)

      switch (status.type) {
        case "ProfileLoading":
          return [modelNew, Cmd.None]

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(route, status.auth)

          return [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))]
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status.profile,
          )
          return pipe(
            [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          )
        }

        case "AuthLoading":
          return [modelNew, Cmd.None]

        case "ProfileError":
          return [modelNew, Cmd.None]

        case "LoggedOut": {
          const [page, pageCmd] = Pages.initLoggedOut(route)

          return [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))]
        }

        default:
          return exhaustive(status)
      }
    }

    case "Connection": {
      const [connectionNew, connectionCmd] = Connection.update(
        msg[1],
        model.connection,
      )
      return [
        { ...model, connection: connectionNew },
        pipe(connectionCmd, Cmd.map(tag("Connection"))),
      ]
    }

    case "BackendToFrontend":
      return updateFromBackend(msg[1], model)

    default:
      return exhaustive(msg)
  }
}

const updateStatusChanged =
  (modelPrev: Model) =>
  (_msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    const statusPrev = toStatus(modelPrev)
    const statusNew = toStatus(model)

    if (statusNew.type === statusPrev.type) {
      return [model, Cmd.None]
    }

    switch (statusNew.type) {
      case "ProfileLoading": {
        const action: OutAction = [
          "Store",
          ["Profile", ["FindMany", { userIds: [statusNew.auth.userId] }]],
        ]

        return pipe([model, Cmd.None], andThenMany(runAction, [action]))
      }

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.auth,
        )

        return [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))]
      }

      case "ProfileError":
        return [model, Cmd.None]

      case "AuthLoading":
        return [model, Cmd.None]

      case "LoggedOut": {
        const [page, pageCmd] = Pages.initLoggedOut(model.route)
        return [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))]
      }

      case "Ready": {
        const [page, pageCmd, actions] = Pages.initReady(
          model.route,
          statusNew.profile,
        )
        return pipe(
          [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))],
          andThenMany(runAction, actions),
        )
      }

      default:
        return exhaustive(statusNew)
    }
  }

const runAction = (action: OutAction, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.runAction(action, model.store)
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(tag("Store"))),
      ]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action,
        model.snackbar,
      )
      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(tag("Snackbar"))),
      ]
    }

    case "GameRoom": {
      if (model.auth.type !== "LoggedIn") {
        return [model, Cmd.None]
      }

      const currentUserId = model.auth.userId

      const [child, childCmd] = GameRoom.Frontend.runAction(
        { currentUserId },
        action,
        model.gameRoom,
      )
      return [
        { ...model, gameRoom: child },
        pipe(childCmd, Cmd.map(tag("GameRoom"))),
      ]
    }

    case "Auth": {
      const [authNew, authCmd] = Auth.runAction(action, model.auth)
      return [{ ...model, auth: authNew }, pipe(authCmd, Cmd.map(tag("Auth")))]
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
    model.auth.type === "LoggedIn"
      ? pipe(
          GameRoom.Frontend.subscriptions(
            { currentUserId: model.auth.userId },
            model.gameRoom,
          ),
          Sub.map(tag("GameRoom")),
        )
      : Sub.None,
    pipe(Pages.subscriptions(model.page), Sub.map(tag("Page"))),
    pipe(Auth.subscriptions, Sub.map(tag("Auth"))),
    pipe(Connection.subscriptions, Sub.map(tag("Connection"))),
    fromBackend((toFrontend) => ["BackendToFrontend", toFrontend]),
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

  switch (status.type) {
    case "AuthLoading":
    case "LoggedOut":
    case "ProfileLoading":
    case "ProfileMissing":
    case "ProfileError":
      return "System"
    case "Ready":
      return status.profile.themeMode
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

  switch (model.connection) {
    case "Connecting":
      return viewLoading({ reason: "Connecting..." })

    case "Disconnected":
      return viewLoading({ reason: "Disconnected." })

    case "Reconnecting":
      return viewLoading({ reason: "Reconnecting..." })

    case "Connected": {
      switch (status.type) {
        case "AuthLoading":
          return viewLoading({ reason: "Authenitcation loading..." })

        case "ProfileLoading":
          return viewLoading({ reason: "Profile loading..." })

        case "ProfileError":
          return viewError({ reason: "Failed to load profile." })

        case "LoggedOut":
          return pipe(Pages.viewLoggedOut(model.page), UI.map(tag("Page")))

        case "ProfileMissing":
          return pipe(
            Pages.viewProfileMissing(status.auth, model.page),
            UI.map(tag("Page")),
          )

        case "Ready":
          return (dispatch) => (
            <>
              {pipe(
                GameRoom.Frontend.viewBanner(
                  { currentUserId: status.profile.userId, route: model.route },
                  model.gameRoom,
                ),
                UI.map(tag("GameRoom")),
              )(dispatch)}
              <UI.FillBox>
                {pipe(
                  Pages.viewReady(
                    { ...model, profile: status.profile },
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
    location,
    Route.decode,
    Option.withDefault<Route.Route>({ type: "Home" }),
    (route) => ["Route", ["GotRoute", route]],
  )
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
