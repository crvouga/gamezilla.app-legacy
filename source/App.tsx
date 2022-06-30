import * as Games from "Games"
import * as Pages from "Pages"
import * as Route from "Route"
import * as Session from "Session"
import * as Snackbar from "Snackbar"
import * as Store from "Store"
import * as Profile from "Store/Profile"
import * as View from "View"
import * as ReactDom from "react-dom/client"
import { Browser, Cmd, Debug, Option, Sub, pipe } from "Core"
import { andThen, andThenMany, exhaustive, groupTag } from "Utility"

//
//
//
// Model
//
//
//

export type Model = {
  snackbar: Snackbar.Model
  store: Store.Model
  session: Session.Model
  game: Games.Model
  page: Pages.Model
  route: Route.Route
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

      const result = Option.fromNullable(store.Profile[userId])

      switch (result.type) {
        case "Some":
          return {
            type: "Ready",
            session,
            profile: result.value,
          }

        case "None":
          const profileQuery = Store.Profile.toGetQuery(userId, store)

          switch (profileQuery.type) {
            case "NotAsked":
              return { type: "ProfileLoading", session }

            case "Loading":
              return { type: "ProfileLoading", session }

            case "Failure":
              return { type: "ProfileMissing", session }

            case "Success":
              return {
                type: "Ready",
                session,
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
  const route = Option.withDefault(
    { type: "Home" },
    Route.decode(location.pathname),
  )
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
  | Session.Msg
  | Pages.GroupedMsg

type Action = Snackbar.Action | Store.Action | Games.Action | Session.Action

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
  switch (msg.group) {
    case "Store": {
      const [storeNew, storeCmd, actions] = Store.update(msg, model.store)

      return pipe(
        [
          { ...model, store: storeNew },
          pipe(storeCmd, Cmd.map(groupTag("Store"))),
        ],
        andThenMany(runAction, actions),
      )
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.update(msg, model.session)

      return [{ ...model, session: sessionNew }, sessionCmd]
    }

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg, model.snackbar)

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
      ]

    case "Game": {
      const [gameNew, gameCmd, actions] = Games.update(msg, model.game)

      return pipe(
        [{ ...model, game: gameNew }, pipe(gameCmd, Cmd.map(groupTag("Game")))],
        andThenMany(runAction, actions),
      )
    }

    case "Page": {
      const status = toStatus(model)

      switch (status.type) {
        case "SessionLoading":
          return [model, Cmd.None]

        case "ProfileLoading":
          return [model, Cmd.None]

        case "SessionMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateSessionMissing(
            msg,
            model.page,
          )

          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          )
        }

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.session,
            msg,
            model.page,
          )
          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          )
        }

        case "Ready": {
          if (model.page.page === "Game" && model.game.type === "Closed") {
            return [model, Route.replace({ type: "Home" })]
          }

          const [pageNew, pageCmd, actions] = Pages.updateReady(
            { profile: status.profile, store: model.store },
            msg,
            model.page,
          )

          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          )
        }
      }
    }

    case "Route": {
      const route = msg.route

      const modelNew = { ...model, route }

      const status = toStatus(modelNew)

      switch (status.type) {
        case "ProfileLoading":
          return [modelNew, Cmd.None]

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(
            route,
            status.session,
          )

          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
          ]
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status.profile,
          )
          return pipe(
            [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))],
            andThenMany(runAction, actions),
          )
        }

        case "SessionLoading":
          return [modelNew, Cmd.None]

        case "SessionMissing": {
          const [page, pageCmd] = Pages.initSessionMissing(route)

          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
          ]
        }
      }
    }

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
        const actions = [Store.Profile.Get(statusNew.session.userId)]
        return pipe([model, Cmd.None], andThenMany(runAction, actions))

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.session,
        )

        return [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))]
      }

      case "SessionLoading":
        return [model, Cmd.None]

      case "SessionMissing": {
        const [page, pageCmd] = Pages.initSessionMissing(model.route)
        return [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))]
      }

      case "Ready": {
        if (model.route.type === "Game" && model.game.type === "Closed") {
          return [model, Route.replace({ type: "Home" })]
        }

        const [page, pageCmd, actions] = Pages.initReady(
          model.route,
          statusNew.profile,
        )
        return pipe(
          [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))],
          andThenMany(runAction, actions),
        )
      }

      default:
        return exhaustive(statusNew)
    }
  }

const runAction = (action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (action.group) {
    case "Store": {
      const [storeNew, storeCmd] = Store.runAction(action, model.store)
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(groupTag("Store"))),
      ]
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action,
        model.snackbar,
      )
      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
      ]
    }

    case "Game": {
      const [gamesNew, gamesCmd] = Games.runAction(action, model.game)
      return [
        { ...model, game: gamesNew },
        pipe(gamesCmd, Cmd.map(groupTag("Game"))),
      ]
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.runAction(action, model.session)
      return [
        { ...model, session: sessionNew },
        pipe(sessionCmd, Cmd.map(groupTag("Session"))),
      ]
    }

    default:
      return exhaustive(action)
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
    pipe(Browser.location$, Sub.map(onLocationChange)),
    pipe(Games.subscriptions(model.game), Sub.map(groupTag("Game"))),
    pipe(Pages.subscriptions(model.page), Sub.map(groupTag("Page"))),
    Session.subscriptions,
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
  (dispatch) => {
    return (
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
            // backgroundColor: "red",
          }}
        >
          {viewGameBanner(model)(dispatch)}
          <View.Box
            sx={{
              width: "100%",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {viewMain(model)(dispatch)}
          </View.Box>

          {pipe(
            Snackbar.view({}, model.snackbar),
            View.map(groupTag("Snackbar")),
          )(dispatch)}
        </View.Box>
      </View.ThemeProvider>
    )
  }

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
            route: model.route,
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

const viewGameBanner =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    switch (model.game.type) {
      case "Closed":
        return <></>

      case "Opened":
        if (model.page.page === "Game") {
          return <></>
        }

        return (
          <>
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
// Location
//
//
//

export const onLocationChange = (location: Browser.Location): Msg => {
  return pipe(
    location,
    (location) => location.pathname,
    Route.decode,
    (decoded) => Option.withDefault({ type: "Home" }, decoded),
    Route.GotRoute,
  )
}
