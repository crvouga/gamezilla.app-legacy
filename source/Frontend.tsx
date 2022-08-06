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

    case "LoggedIn":
      const { userId } = auth

      const result = Option.fromNullable(store.Profile[userId])

      switch (result.type) {
        case "Some":
          return {
            type: "Ready",
            auth,
            profile: result.value,
          }

        case "None":
          const profileQuery = Store.Profile.toProfile(userId, store)

          switch (profileQuery.type) {
            case "NotAsked":
              return { type: "ProfileLoading", auth }

            case "Loading":
              return { type: "ProfileLoading", auth }

            case "Failure":
              return { type: "ProfileMissing", auth }

            case "Success":
              return {
                type: "Ready",
                auth,
                profile: profileQuery.value,
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
        case "ProfileLoading":
        case "ProfileMissing":
        case "AuthLoading":
        case "LoggedOut":
          return [model, Cmd.None]

        case "Ready": {
          const { profile } = status
          const [child, childCmd, actions] = GameRoom.Frontend.update(
            { currentUserId: profile.userId },
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

    case "Page": {
      const status = toStatus(model)

      switch (status.type) {
        case "AuthLoading":
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
  (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    const statusPrev = toStatus(modelPrev)
    const statusNew = toStatus(model)

    if (statusNew.type === statusPrev.type) {
      return [model, Cmd.None]
    }

    switch (statusNew.type) {
      case "ProfileLoading":
        const action: OutAction = [
          "Store",
          ["Profile", ["FindMany", { userIds: [statusNew.auth.userId] }]],
        ]

        return pipe([model, Cmd.None], andThenMany(runAction, [action]))

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.auth,
        )

        return [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))]
      }

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
      const [child, childCmd] = GameRoom.Frontend.runAction(
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
    // pipe(Games.subscriptions(model.game), Sub.map(tag("Game"))),
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
          <UI.Box sx={{ width: "100%", overflow: "hidden", flex: 1 }}>
            {viewMain(model)(dispatch)}
          </UI.Box>

          {pipe(
            Snackbar.view({}, model.snackbar),
            UI.map(tag("Snackbar")),
          )(dispatch)}

          {viewGameBanner(model)(dispatch)}
        </UI.Box>
      </UI.ThemeProvider>
    )
  }

const viewMain = (model: Model): UI.View<Msg> => {
  const status = toStatus(model)

  switch (model.connection) {
    case "Connecting":
    case "Disconnected":
    case "Reconnecting":
      return viewLoading

    case "Connected": {
      switch (status.type) {
        case "AuthLoading":
        case "ProfileLoading":
          return viewLoading

        case "LoggedOut":
          return pipe(Pages.viewLoggedOut(model.page), UI.map(tag("Page")))

        case "ProfileMissing":
          return pipe(
            Pages.viewProfileMissing(status.auth, model.page),
            UI.map(tag("Page")),
          )

        case "Ready":
          return pipe(
            Pages.viewReady(
              {
                route: model.route,
                profile: status.profile,
                gameRoom: model.gameRoom,
                store: model.store,
              },
              model.page,
            ),
            UI.map(tag("Page")),
          )
      }
    }
  }
}

const viewLoading: UI.View<Msg> = () => <UI.LoadingPage />

const viewGameBanner =
  (model: Model): UI.View<Msg> =>
  (dispatch) => {
    return <></>
    // switch (model.game.type) {
    //   case "Closed":
    //     return <></>

    //   case "Opened":
    //     if (model.page[0] === "Game") {
    //       return <></>
    //     }

    //     return (
    //       <>
    //         {pipe(Games.viewBanner(model.game), UI.map(tag("Game")))(dispatch)}
    //       </>
    //     )
    // }
  }

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

const stop = Browser.run(program, (dom) => {
  root.render(dom)
})

//
//
//
// Hot Reload
//
//
//

const dispose = () => {
  stop()
}

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept()
  // @ts-ignore
  import.meta.hot.dispose(dispose)
}
