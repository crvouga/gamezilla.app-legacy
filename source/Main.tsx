import * as Games from "Games";
import * as Pages from "Pages";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as Profile from "Store/Profile";
import * as UI from "UI";
import * as ReactDomClient from "react-dom/client";
import { Browser, Cmd, Debug, Fullstack, Option, Sub, pipe } from "Core";
import { andThen, andThenMany, exhaustive, groupTag } from "Utility";
import { FrontendModel, FrontendMsg, ToFrontend, sendToBackend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

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
  | { type: "Ready"; profile: Profile.Profile; session: Session.LoggedIn };

export const toStatus = ({
  store,
  session,
}: {
  store: Store.Model;
  session: Session.Model;
}): Status => {
  switch (session.type) {
    case "Loading":
      return { type: "SessionLoading" };

    case "LoggedOut":
      return { type: "SessionMissing" };

    case "LoggedIn":
      const { userId } = session;

      const result = Option.fromNullable(store.Profile[userId]);

      switch (result.type) {
        case "Some":
          return {
            type: "Ready",
            session,
            profile: result.value,
          };

        case "None":
          const profileQuery = Store.Profile.toGetQuery(userId, store);

          switch (profileQuery.type) {
            case "NotAsked":
              return { type: "ProfileLoading", session };

            case "Loading":
              return { type: "ProfileLoading", session };

            case "Failure":
              return { type: "ProfileMissing", session };

            case "Success":
              return {
                type: "Ready",
                session,
                profile: profileQuery.value,
              };
          }
      }
  }
};

//
//
//
// Init
//
//
//

export const init = (location: Browser.Location): [Model, Cmd.Cmd<Msg>] => {
  const route = Option.withDefault({ type: "Home" }, Route.decode(location));
  const [session, sessionCmd] = Session.init();
  const snackbar = Snackbar.init;
  const store = Store.init;
  const game = Games.init;
  const [page, pageCmd] = Pages.initLoading();

  return [
    {
      route,
      snackbar,
      store,
      game,
      session,
      page,
      socket: { type: "Connecting" },
    },
    Cmd.batch<Msg>([
      pipe(sessionCmd, Cmd.map(groupTag("Session"))),
      pipe(pageCmd, Cmd.map(groupTag("Page"))),
    ]),
  ];
};

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg;

type Action = Snackbar.Action | Store.Action | Games.Action | Session.Action;

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
  );
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "GotCounter":
      return [{ ...model, counter: msg.counter }, Cmd.None];
  }
};

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Store": {
      const [storeNew, storeCmd, actions] = Store.update(msg, model.store);

      return pipe(
        [
          { ...model, store: storeNew },
          pipe(storeCmd, Cmd.map(groupTag("Store"))),
        ],
        andThenMany(runAction, actions),
      );
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.update(msg, model.session);

      return [{ ...model, session: sessionNew }, sessionCmd];
    }

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg, model.snackbar);

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
      ];

    case "Game": {
      const [gameNew, gameCmd, actions] = Games.update(msg, model.game);

      return pipe(
        [{ ...model, game: gameNew }, pipe(gameCmd, Cmd.map(groupTag("Game")))],
        andThenMany(runAction, actions),
      );
    }

    case "Page": {
      const status = toStatus(model);

      switch (status.type) {
        case "SessionLoading":
          return [model, Cmd.None];

        case "ProfileLoading":
          return [model, Cmd.None];

        case "SessionMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateSessionMissing(
            msg,
            model.page,
          );

          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          );
        }

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.session,
            msg,
            model.page,
          );
          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          );
        }

        case "Ready": {
          if (model.page.page === "Game" && model.game.type === "Closed") {
            return [model, Route.replace({ type: "Home" })];
          }

          const [pageNew, pageCmd, actions] = Pages.updateReady(
            { profile: status.profile, store: model.store },
            msg,
            model.page,
          );

          return pipe(
            [
              { ...model, page: pageNew },
              pipe(pageCmd, Cmd.map(groupTag("Page"))),
            ],
            andThenMany(runAction, actions),
          );
        }
      }
    }

    case "Route": {
      const route = msg.route;

      const modelNew = { ...model, route };

      const status = toStatus(modelNew);

      switch (status.type) {
        case "ProfileLoading":
          return [modelNew, Cmd.None];

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(
            route,
            status.session,
          );

          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
          ];
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status.profile,
          );
          return pipe(
            [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))],
            andThenMany(runAction, actions),
          );
        }

        case "SessionLoading":
          return [modelNew, Cmd.None];

        case "SessionMissing": {
          const [page, pageCmd] = Pages.initSessionMissing(route);

          return [
            { ...modelNew, page },
            pipe(pageCmd, Cmd.map(groupTag("Page"))),
          ];
        }
      }
    }

    case "Counter":
      switch (msg.type) {
        case "ClickedToggle":
          return [model, sendToBackend({ group: "Counter", type: "Toggle" })];

        case "ClickedReset":
          return [
            {
              ...model,
              counter: model.counter
                ? { ...model.counter, count: 0 }
                : undefined,
            },
            sendToBackend({ group: "Counter", type: "Reset" }),
          ];
      }

    case "Socket":
      switch (msg.type) {
        case "SocketChanged":
          return [{ ...model, socket: msg.socket }, Cmd.None];
      }

    default:
      return exhaustive(msg);
  }
};

const updateStatusChanged =
  (modelPrev: Model) =>
  (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    const statusPrev = toStatus(modelPrev);
    const statusNew = toStatus(model);

    if (statusNew.type === statusPrev.type) {
      return [model, Cmd.None];
    }

    switch (statusNew.type) {
      case "ProfileLoading":
        const actions = [Store.Profile.Get(statusNew.session.userId)];
        return pipe([model, Cmd.None], andThenMany(runAction, actions));

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.session,
        );

        return [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))];
      }

      case "SessionLoading":
        return [model, Cmd.None];

      case "SessionMissing": {
        const [page, pageCmd] = Pages.initSessionMissing(model.route);
        return [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))];
      }

      case "Ready": {
        if (model.route.type === "Game" && model.game.type === "Closed") {
          return [model, Route.replace({ type: "Home" })];
        }

        const [page, pageCmd, actions] = Pages.initReady(
          model.route,
          statusNew.profile,
        );
        return pipe(
          [{ ...model, page }, pipe(pageCmd, Cmd.map(groupTag("Page")))],
          andThenMany(runAction, actions),
        );
      }

      default:
        return exhaustive(statusNew);
    }
  };

const runAction = (action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (action.group) {
    case "Store": {
      const [storeNew, storeCmd] = Store.runAction(action, model.store);
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(groupTag("Store"))),
      ];
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action,
        model.snackbar,
      );
      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(groupTag("Snackbar"))),
      ];
    }

    case "Game": {
      const [gamesNew, gamesCmd] = Games.runAction(action, model.game);
      return [
        { ...model, game: gamesNew },
        pipe(gamesCmd, Cmd.map(groupTag("Game"))),
      ];
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.runAction(action, model.session);
      return [
        { ...model, session: sessionNew },
        pipe(sessionCmd, Cmd.map(groupTag("Session"))),
      ];
    }

    default:
      return exhaustive(action);
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    pipe(Games.subscriptions(model.game), Sub.map(groupTag("Game"))),
    pipe(Pages.subscriptions(model.page), Sub.map(groupTag("Page"))),
    Session.subscriptions,
  ]);
};

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): UI.ThemeMode => {
  const status = toStatus(model);

  switch (status.type) {
    case "SessionLoading":
    case "SessionMissing":
    case "ProfileLoading":
    case "ProfileMissing":
      return "System";
    case "Ready":
      return status.profile.themeMode;
  }
};

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
          <UI.Collapse
            in={
              model.socket.type === "Reconnecting" ||
              model.socket.type === "Disconnected"
            }
          >
            <UI.Alert
              severity={model.socket.type === "Disconnected" ? "error" : "info"}
              sx={{ display: "flex", alignItems: "center" }}
              icon={<UI.CircularProgress disableShrink size={18} />}
            >
              {model.socket.type === "Reconnecting"
                ? `Reconnecting to backend...`
                : "Failed to connect to backend."}
            </UI.Alert>
          </UI.Collapse>

          <UI.Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <UI.Typography sx={{ flex: 1 }}>
              {model.counter?.count ?? "Loading..."}
            </UI.Typography>
            <UI.Button
              onClick={() =>
                dispatch({ group: "Counter", type: "ClickedReset" })
              }
              disabled={model.counter === undefined}
            >
              Reset
            </UI.Button>
            <UI.Button
              onClick={() =>
                dispatch({ group: "Counter", type: "ClickedToggle" })
              }
              disabled={model.counter === undefined}
            >
              {model.counter
                ? model.counter.status === "Idle"
                  ? "Play"
                  : "Pause"
                : "..."}
            </UI.Button>
          </UI.Box>
          {viewGameBanner(model)(dispatch)}
          <UI.Box
            sx={{
              width: "100%",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {viewMain(model)(dispatch)}
          </UI.Box>

          {pipe(
            Snackbar.view({}, model.snackbar),
            UI.map(groupTag("Snackbar")),
          )(dispatch)}
        </UI.Box>
      </UI.ThemeProvider>
    );
  };

const viewMain = (model: Model): UI.View<Msg> => {
  const status = toStatus(model);

  switch (status.type) {
    case "SessionLoading":
      return viewLoading;

    case "ProfileLoading":
      return viewLoading;

    case "SessionMissing":
      return pipe(
        Pages.viewSessionMissing(model.page),
        UI.map(groupTag("Page")),
      );

    case "ProfileMissing":
      return pipe(
        Pages.viewProfileMissing(status.session, model.page),
        UI.map(groupTag("Page")),
      );

    case "Ready":
      if (model.route.type === "Game") {
        return pipe(Games.view(model.game), UI.map(groupTag("Game")));
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
        UI.map(groupTag("Page")),
      );
  }
};

const viewLoading: UI.View<Msg> = () => <UI.LoadingPage />;

const viewGameBanner =
  (model: Model): UI.View<Msg> =>
  (dispatch) => {
    switch (model.game.type) {
      case "Closed":
        return <></>;

      case "Opened":
        if (model.page.page === "Game") {
          return <></>;
        }

        return (
          <>
            {pipe(
              Games.viewBanner(model.game),
              UI.map(groupTag("Game")),
            )(dispatch)}
          </>
        );
    }
  };

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
    (decoded) => Option.withDefault({ type: "Home" }, decoded),
    Route.GotRoute,
  );
};

const onSocketChanged = (socket: Fullstack.FrontendSocket): Msg => {
  return { group: "Socket", type: "SocketChanged", socket };
};

//
//
//
// Main
//
//
//

const program = Debug.ReduxDevTools.withDebugger(
  Fullstack.frontend({
    backendUrl: "http://localhost:5000/",
    onLocationChange: onLocationChange,
    onSocketChanged: onSocketChanged,
    init: init,
    update: update,
    updateFromBackend: updateFromBackend,
    subscriptions: subscriptions,
    view: view,
  }),
);

const container = document.getElementById("root");

const root = ReactDomClient.createRoot(container!);

const stop = Browser.run(program, (dom) => {
  root.render(dom);
});

//
//
//
// Hot Reload
//
//
//

// const dispose = () => {
//   stop();
// };

// // @ts-ignore
// if (import.meta.hot) {
//   // @ts-ignore
//   import.meta.hot.accept();
//   // @ts-ignore
//   import.meta.hot.dispose(dispose);
// }
