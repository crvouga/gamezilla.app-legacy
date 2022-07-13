import * as Connection from "Connection";
import * as Counter from "Counter/Frontend";
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
import { andThen, andThenMany, exhaustive, tag } from "Utility";
import { FrontendModel, FrontendMsg, ToFrontend } from "./Types";

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
  const route = pipe(
    location,
    Route.decode,
    Option.withDefault<Route.Route>({ type: "Home" }),
  );
  const [session, sessionCmd] = Session.init();
  const snackbar = Snackbar.init;
  const store = Store.init;
  const game = Games.init;
  const [page, pageCmd] = Pages.initLoading();
  const [counter, counterCmd] = Counter.init;
  const connection = Connection.init;
  return [
    {
      route,
      snackbar,
      store,
      game,
      session,
      page,
      connection,
      counter,
    },
    Cmd.batch<Msg>([
      pipe(sessionCmd, Cmd.map(tag("Session"))),
      pipe(pageCmd, Cmd.map(tag("Page"))),
      pipe(counterCmd, Cmd.map(tag("Counter"))),
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

type Action =
  | ["Snackbar", Snackbar.Action]
  | ["Store", Store.Action]
  | ["Games", Games.Action]
  | ["Session", Session.Action];

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
  switch (msg.group) {
    case "Counter": {
      const [counterNew, counterCmd] = Counter.updateFromBackend(
        msg,
        model.counter,
      );
      return [
        { ...model, counter: counterNew },
        pipe(counterCmd, Cmd.map(tag("Counter"))),
      ];
    }
  }
};

const updateMain = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.update(msg[1], model.store);

      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(tag("Store"))),
      ];
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.update(msg[1], model.session);

      return [
        { ...model, session: sessionNew },
        pipe(sessionCmd, Cmd.map(tag("Session"))),
      ];
    }

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(
        msg[1],
        model.snackbar,
      );

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(tag("Snackbar"))),
      ];

    case "Game": {
      const [gameNew, gameCmd, actions] = Games.update(msg[1], model.game);

      return pipe(
        [{ ...model, game: gameNew }, pipe(gameCmd, Cmd.map(tag("Game")))],
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
            msg[1],
            model.page,
          );

          return pipe(
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          );
        }

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.session,
            msg[1],
            model.page,
          );
          return pipe(
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          );
        }

        case "Ready": {
          if (model.page[0] === "Game" && model.game.type === "Closed") {
            return [model, Route.replace({ type: "Home" })];
          }

          const [pageNew, pageCmd, actions] = Pages.updateReady(
            { profile: status.profile, store: model.store },
            msg[1],
            model.page,
          );

          return pipe(
            [{ ...model, page: pageNew }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          );
        }
      }
    }

    case "Route": {
      const route = msg[1][1];

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

          return [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))];
        }

        case "Ready": {
          const [page, pageCmd, actions] = Pages.initReady(
            route,
            status.profile,
          );
          return pipe(
            [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))],
            andThenMany(runAction, actions),
          );
        }

        case "SessionLoading":
          return [modelNew, Cmd.None];

        case "SessionMissing": {
          const [page, pageCmd] = Pages.initSessionMissing(route);

          return [{ ...modelNew, page }, pipe(pageCmd, Cmd.map(tag("Page")))];
        }
      }
    }

    case "Counter":
      const [counterNew, counterCmd] = Counter.update(msg[1], model.counter);
      return [
        { ...model, counter: counterNew },
        pipe(counterCmd, Cmd.map(tag("Counter"))),
      ];

    case "Connection":
      const [connectionNew, connectionCmd] = Connection.update(
        msg[1],
        model.connection,
      );
      return [
        { ...model, connection: connectionNew },
        pipe(connectionCmd, Cmd.map(tag("Connection"))),
      ];

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
        return pipe(
          [model, Cmd.None],
          andThenMany(runAction, [
            ["Store", Store.Profile.Get(statusNew.session.userId)],
          ]),
        );

      case "ProfileMissing": {
        const [page, pageCmd] = Pages.initProfileMissing(
          model.route,
          statusNew.session,
        );

        return [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))];
      }

      case "SessionLoading":
        return [model, Cmd.None];

      case "SessionMissing": {
        const [page, pageCmd] = Pages.initSessionMissing(model.route);
        return [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))];
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
          [{ ...model, page }, pipe(pageCmd, Cmd.map(tag("Page")))],
          andThenMany(runAction, actions),
        );
      }

      default:
        return exhaustive(statusNew);
    }
  };

const runAction = (action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "Store": {
      const [storeNew, storeCmd] = Store.runAction(action[1], model.store);
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, Cmd.map(tag("Store"))),
      ];
    }

    case "Snackbar": {
      const [snackbarNew, snackbarCmd] = Snackbar.runAction(
        action[1],
        model.snackbar,
      );
      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, Cmd.map(tag("Snackbar"))),
      ];
    }

    case "Games": {
      const [gamesNew, gamesCmd] = Games.runAction(action[1], model.game);
      return [
        { ...model, game: gamesNew },
        pipe(gamesCmd, Cmd.map(tag("Game"))),
      ];
    }

    case "Session": {
      const [sessionNew, sessionCmd] = Session.runAction(
        action[1],
        model.session,
      );
      return [
        { ...model, session: sessionNew },
        pipe(sessionCmd, Cmd.map(tag("Session"))),
      ];
    }

    default:
      return exhaustive(action[0]);
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
    pipe(Games.subscriptions(model.game), Sub.map(tag("Game"))),
    pipe(Pages.subscriptions(model.page), Sub.map(tag("Page"))),
    pipe(Session.subscriptions, Sub.map(tag("Session"))),
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
          {pipe(
            Connection.view(model.connection),
            UI.map(tag("Connection")),
          )(dispatch)}
          {/* {Counter.view(model.counter)(dispatch)} */}
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
            UI.map(tag("Snackbar")),
          )(dispatch)}

          {viewGameBanner(model)(dispatch)}
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
      return pipe(Pages.viewSessionMissing(model.page), UI.map(tag("Page")));

    case "ProfileMissing":
      return pipe(
        Pages.viewProfileMissing(status.session, model.page),
        UI.map(tag("Page")),
      );

    case "Ready":
      if (model.route.type === "Game") {
        return pipe(Games.view(model.game), UI.map(tag("Game")));
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
        UI.map(tag("Page")),
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
        if (model.page[0] === "Game") {
          return <></>;
        }

        return (
          <>
            {pipe(Games.viewBanner(model.game), UI.map(tag("Game")))(dispatch)}
          </>
        );
    }
  };

//
//
//
//
//
//
//

export const onLocationChange = (location: Browser.Location): Msg => {
  return pipe(
    location,
    Route.decode,
    Option.withDefault<Route.Route>({ type: "Home" }),
    (route) => ["Route", ["GotRoute", route]],
  );
};

const onConnectionChange = (status: Fullstack.ConnectionStatus): Msg => [
  "Connection",
  ["ConnectionChanged", status],
];

//
//
//
// Main
//
//
//

// todo put this in env var
const productionBackendUrl = "https://gamezilla.herokuapp.com/";

const developmentBackendUrl = "http://localhost:5000/";

const backendUrl =
  process.env.NODE_ENV === "production"
    ? productionBackendUrl
    : developmentBackendUrl;

console.log(`using backendUrl: ${backendUrl}`);

const program = Debug.ReduxDevTools.withDebugger(
  Fullstack.frontend({
    backendUrl: backendUrl,
    onLocationChange: onLocationChange,
    onConnectionChange: onConnectionChange,
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
