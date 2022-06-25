import * as Games from "Games"
import * as Pages from "Pages"
import * as Route from "Route"
import * as Session from "Session"
import * as Snackbar from "Snackbar"
import * as Store from "Store"
import * as Profile from "Store/Profile"
import * as View from "View"
import * as ReactDom from "react-dom/client"
import { Cmd, Html, Sub, Task, pipe } from "Core"
import { programWithDebugger } from "Core/Debug/Html"
import { andThen, andThenMany, exhaustive, groupTag } from "Utility"

//
//
//
// Model
//
//
//

type Model = {
  snackbar: Snackbar.Model
  store: Store.Model
  session: Session.Model
  game: Games.Model
  page: Pages.Model
  route: Route.Model
}

//
//
//
// Status
//
//
//

type Status =
  | { type: "SessionLoading" }
  | { type: "SessionMissing" }
  | { type: "ProfileLoading"; session: Session.LoggedIn }
  | { type: "ProfileMissing"; session: Session.LoggedIn }
  | { type: "Ready"; profile: Profile.Profile; session: Session.LoggedIn }

export const toStatus = ({
  store,
  session,
}: {
  store: Store.Model
  session: Session.Model
}): Status => {
  switch (session.type) {
    case "Loading":
      return { type: "SessionLoading" }

    case "LoggedOut":
      return { type: "SessionMissing" }

    case "LoggedIn":
      const { userId } = session

      const profileQuery = Store.Profile.toGetQuery(userId, store)

      switch (profileQuery.type) {
        case "NotAsked":
          return { type: "ProfileLoading", session }

        case "Loading":
          return { type: "ProfileLoading", session }

        case "Failure":
          return { type: "ProfileMissing", session }

        case "Success":
          return { type: "Ready", session, profile: profileQuery.value }
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

export type Flags = Route.Flags

export const init = (flags: Flags): [Model, Cmd.Cmd<Msg>] => {
  const route = Route.init(flags)
  const [session, sessionCmd] = Session.init()
  const snackbar = Snackbar.init
  const store = Store.init
  const game = Games.init
  const [page, pageCmd] = Pages.initLoading()

  return [
    {
      route,
      snackbar,
      store,
      game,
      session,
      page,
    },
    Cmd.batch<Msg>([
      pipe(sessionCmd, Cmd.map(groupTag("Session"))),
      pipe(pageCmd, Cmd.map(groupTag("Page"))),
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

export type Msg =
  | Route.Msg
  | Snackbar.GroupedMsg
  | Games.GroupedMsg
  | Store.GroupedMsg
  | Session.GroupedMsg
  | Pages.GroupedMsg

//
//
//
// Update
//
//
//

export const update = (msg: Msg, modelPrev: Model): [Model, Cmd.Cmd<Msg>] => {
  return pipe(
    [modelPrev, Cmd.none],

    andThen(updateMain, msg),

    andThen(updateStatusChanged(modelPrev), msg),

    ([modelNew, cmdNew, actions]) =>
      pipe([modelNew, cmdNew], andThenMany(updateAction, actions)),

    ([modelNew, cmdNew]) =>
      pipe([modelNew, cmdNew], andThen(updateStatusChanged(modelPrev), msg)),

    ([modelNew, cmdNew, actions]) =>
      pipe([modelNew, cmdNew], andThenMany(updateAction, actions)),
  )
}

const updateStatusChanged =
  (modelPrev: Model) =>
  (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>, Msg[]] => {
    const statusPrev = toStatus(modelPrev)
    const statusNew = toStatus(model)

    if (statusNew.type === statusPrev.type) {
      return [model, Cmd.none, []]
    }

    switch (statusNew.type) {
      case "ProfileLoading":
        return [model, Cmd.none, [Store.Profile.Get(statusNew.session.userId)]]

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.session,
        )

        return [
          { ...model, page },
          pipe(pageCmd, Cmd.map(groupTag("Page"))),
          [],
        ]
      }

      case "SessionLoading":
        return [model, Cmd.none, []]

      case "SessionMissing": {
        const [page, pageCmd] = Pages.initSessionMissing(model.route)
        return [
          { ...model, page },
          pipe(pageCmd, Cmd.map(groupTag("Page"))),
          [],
        ]
      }

      case "Ready": {
        if (model.route.type === "Game" && model.game.type === "Closed") {
          return [model, Route.replace({ type: "Home" }), []]
        }

        const [page, pageCmd, actions] = Pages.initReady(
          model.route,
          statusNew.profile,
        )
        return [
          { ...model, page },
          pipe(pageCmd, Cmd.map(groupTag("Page"))),
          actions,
        ]
      }

      default:
        return exhaustive(statusNew)
    }
  }

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>, Msg[]] => {
  switch (msg.group) {
    case "Store": {
      const [storeNew, storeCmd, actions] = Store.update(msg, model.store)

      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(groupTag("Store"))),
        actions,
      ]
    }

    case "Session": {
      const sessionNew = Session.update(msg)
      return [{ ...model, session: sessionNew }, Cmd.none, []]
    }

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg, model.snackbar)

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
        [],
      ]

    case "Game": {
      const [gameNew, gameCmd, actions] = Games.update(msg, model.game)

      return [
        { ...model, game: gameNew },
        pipe(gameCmd, Cmd.map(groupTag("Game"))),
        actions,
      ]
    }

    case "Page": {
      const status = toStatus(model)

      switch (status.type) {
        case "SessionLoading":
          return [model, Cmd.none, []]

        case "SessionMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateSessionMissing(
            msg,
            model.page,
          )

          return [
            { ...model, page: pageNew },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            actions,
          ]
        }

        case "ProfileLoading":
          return [model, Cmd.none, []]

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.session,
            msg,
            model.page,
          )
          return [
            { ...model, page: pageNew },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            actions,
          ]
        }

        case "Ready": {
          if (model.page.page === "Game" && model.game.type === "Closed") {
            return [model, Route.replace({ type: "Home" }), []]
          }

          const [pageNew, pageCmd, actions] = Pages.updateReady(
            { profile: status.profile, store: model.store },
            msg,
            model.page,
          )

          return [
            { ...model, page: pageNew },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            actions,
          ]
        }
      }
    }

    case "Route": {
      const route = msg.route

      const modelNew = { ...model, route }

      const status = toStatus(modelNew)

      switch (status.type) {
        case "ProfileLoading":
          return [modelNew, Cmd.none, []]

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(
            route,
            status.session,
          )

          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            [],
          ]
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status.profile,
          )
          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            actions,
          ]
        }

        case "SessionLoading":
          return [modelNew, Cmd.none, []]

        case "SessionMissing": {
          const [page, pageCmd] = Pages.initSessionMissing(route)
          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
            [],
          ]
        }
      }
    }

    default:
      return exhaustive(msg)
  }
}

const updateAction = (action: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  const { group } = action

  switch (group) {
    case "Store":
      const [storeNew, storeCmd] = Store.update(action, model.store)
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(groupTag("Store"))),
      ]

    case "Page":
      return [model, Cmd.none]

    case "Session":
      return [model, Cmd.none]

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(action, model.snackbar)
      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
      ]

    case "Game":
      const [gameNew, gameCmd, actions] = Games.update(action, model.game)
      return pipe(
        [{ ...model, game: gameNew }, pipe(gameCmd, Cmd.map(groupTag("Game")))],
        andThenMany(updateAction, actions),
      )

    case "Route":
      return [model, Cmd.none]

    default:
      return exhaustive(group)
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
    pipe(Route.subscriptions(), Sub.map(groupTag("Route"))),
    pipe(Session.subscriptions, Sub.map(groupTag("Session"))),
    pipe(Games.subscriptions(model.game), Sub.map(groupTag("Game"))),
    pipe(Pages.subscriptions(model.page), Sub.map(groupTag("Page"))),
  ])
}

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): View.ThemeMode => {
  const status = toStatus(model)

  switch (status.type) {
    case "SessionLoading":
    case "SessionMissing":
    case "ProfileLoading":
    case "ProfileMissing":
      return "Dark"
    case "Ready":
      return status.profile.themeMode
  }
}

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.ThemeProvider themeMode={toThemeMode(model)}>
        <View.Box
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
          <View.Box
            sx={{
              width: "100%",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {viewMain(model)(dispatch)}
          </View.Box>

          {viewSnackbar(model)(dispatch)}
        </View.Box>
      </View.ThemeProvider>
    )

const viewMain = (model: Model): View.View<Msg> => {
  const status = toStatus(model)

  switch (status.type) {
    case "SessionLoading":
      return viewLoading

    case "ProfileLoading":
      return viewLoading

    case "SessionMissing":
      return pipe(
        Pages.viewSessionMissing(model.page),
        View.map(groupTag("Page")),
      )

    case "ProfileMissing":
      return pipe(
        Pages.viewProfileMissing(status.session, model.page),
        View.map(groupTag("Page")),
      )

    case "Ready":
      if (model.route.type === "Game") {
        return pipe(Games.view(model.game), View.map(groupTag("Game")))
      }

      return pipe(
        Pages.viewReady(
          {
            profile: status.profile,
            game: model.game,
            store: model.store,
          },
          model.page,
        ),
        View.map(groupTag("Page")),
      )
  }
}

const viewLoading: View.View<Msg> = () => <View.LoadingPage />

const viewSnackbar =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    switch (model.game.type) {
      case "Closed":
        return (
          <>
            {pipe(
              Snackbar.view({}, model.snackbar),
              View.map(groupTag("Snackbar")),
            )(dispatch)}
          </>
        )

      case "Opened":
        if (model.page.page === "Game") {
          return (
            <>
              {pipe(
                Snackbar.view({}, model.snackbar),
                View.map(groupTag("Snackbar")),
              )(dispatch)}
            </>
          )
        }

        return (
          <>
            {pipe(
              Snackbar.view({ sx: { bottom: 80 } }, model.snackbar),
              View.map(groupTag("Snackbar")),
            )(dispatch)}

            {pipe(
              Games.viewBanner(model.game),
              View.map(groupTag("Game")),
            )(dispatch)}
          </>
        )
    }
  }

//
//
//
// Main
//
//
//

const getFlags: Task.Task<Flags> = async () => {
  return Route.getFlags()
}

const main: Task.Task<void> = async () => {
  const flags = await getFlags()

  const program = programWithDebugger(init(flags), update, view, subscriptions)

  const rootElement = document.getElementById("root")

  if (!rootElement) {
    throw new Error("Failed to get root dom node")
  }

  const root = ReactDom.createRoot(rootElement)

  Html.run(program, (dom) => {
    root.render(dom)
  })
}

main()
