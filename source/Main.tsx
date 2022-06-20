import { pipe } from "fp-ts/lib/function";
import { cmd, html, sub } from "Framework";
import { Cmd } from "Framework/Cmd";
import { programWithDebugger } from "Framework/Debug/Html";
import * as Navigation from "Framework/Navigation";
import * as Games from "Games";
import * as Pages from "Pages";
import * as ReactDom from "react-dom/client";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import * as Profile from "Store/Profile";
import { andThenMany, exhaustive, groupTag } from "Utility";
import * as View from "View";

//
//
//
// Model
//
//
//

type Model = {
  snackbar: Snackbar.Model;
  store: Store.Model;
  session: Session.Model;
  game: Games.Model;
  page: Pages.Model;
  route: Route.Route;
};

type Status =
  | { type: "SessionLoading" }
  | { type: "SessionMissing" }
  | { type: "ProfileLoading"; session: Session.LoggedIn }
  | { type: "ProfileMissing"; session: Session.LoggedIn }
  | { type: "Ready"; profile: Profile.Profile };

export const toStatus = (model: Pick<Model, "session" | "store">): Status => {
  const { session, store } = model;

  switch (session.type) {
    case "Loading":
      return { type: "SessionLoading" };

    case "LoggedOut":
      return { type: "SessionMissing" };

    case "LoggedIn":
      const { userId } = session;

      const profile = Store.toProfile(userId, store);

      switch (profile.type) {
        case "NotAsked":
          return { type: "ProfileLoading", session };

        case "Loading":
          return { type: "ProfileLoading", session };

        case "Failure":
          return { type: "ProfileMissing", session };

        case "Success":
          return { type: "Ready", profile: profile.value };
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

type Flags = {
  location: Navigation.Location;
};

export const init = (flags: Flags): [Model, Cmd<Msg>] => {
  const route = Route.decode(flags.location.pathname) ?? { type: "Home" };
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
    },
    cmd.batch<Msg>([
      pipe(sessionCmd, cmd.map(groupTag("Session"))),
      pipe(pageCmd, cmd.map(groupTag("Page"))),
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

export type Msg =
  | Route.GroupedMsg
  | Snackbar.GroupedMsg
  | Games.GroupedMsg
  | Store.GroupedMsg
  | Session.GroupedMsg
  | Pages.GroupedMsg;

//
//
//
// Update
//
//
//

export const update = (msg: Msg, modelPrev: Model): [Model, Cmd<Msg>] => {
  const [modelNew, cmdNew, actions] = updateMain(msg, modelPrev);

  const statusPrev = toStatus(modelPrev);
  const statusNew = toStatus(modelNew);

  const reactions: Msg[] = [];
  const cmds: Cmd<Msg>[] = [];

  if (
    statusPrev.type !== statusNew.type &&
    statusNew.type === "ProfileLoading"
  ) {
    reactions.push(Store.Profile.Get(statusNew.session.userId));
  }

  if (statusPrev.type === "ProfileLoading" && statusNew.type === "Ready") {
    cmds.push(Route.push({ type: "Home" }));
  }

  if (
    statusPrev.type === "ProfileLoading" &&
    statusNew.type === "ProfileMissing"
  ) {
    cmds.push(Route.push({ type: "ProfileCreate" }));
  }

  if (
    modelPrev.session.type !== modelNew.session.type &&
    modelNew.session.type === "LoggedOut"
  ) {
    console.log("CHANGE");
    cmds.push(Route.push({ type: "Login" }));
  }

  return pipe(
    [modelNew, cmd.batch([cmdNew, ...cmds])],
    andThenMany(updateActions, actions),
    andThenMany(updateActions, reactions)
  );
};

const updateMain = (msg: Msg, model: Model): [Model, Cmd<Msg>, Msg[]] => {
  switch (msg.group) {
    case "Store": {
      const [storeNew, storeCmd] = Store.update(msg, model.store);

      return [
        { ...model, store: storeNew },
        pipe(storeCmd, cmd.map(groupTag("Store"))),
        [],
      ];
    }

    case "Session": {
      const sessionNew = Session.update(msg);
      return [{ ...model, session: sessionNew }, cmd.none, []];
    }

    case "Snackbar":
      const [snackbarNew, snackbarCmd] = Snackbar.update(msg, model.snackbar);

      return [
        { ...model, snackbar: snackbarNew },
        pipe(snackbarCmd, cmd.map(groupTag("Snackbar"))),
        [],
      ];

    case "Game": {
      const [gameNew, gameCmd, actions] = Games.update(msg, model.game);

      return [
        { ...model, game: gameNew },
        pipe(gameCmd, cmd.map(groupTag("Game"))),
        actions,
      ];
    }

    case "Page": {
      const status = toStatus(model);

      switch (status.type) {
        case "SessionLoading":
          return [model, cmd.none, []];

        case "SessionMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateSessionMissing(
            msg,
            model.page
          );

          return [
            { ...model, page: pageNew },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            actions,
          ];
        }

        case "ProfileLoading":
          return [model, cmd.none, []];

        case "ProfileMissing": {
          const [pageNew, pageCmd, actions] = Pages.updateProfileMissing(
            status.session,
            msg,
            model.page
          );
          return [
            { ...model, page: pageNew },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            actions,
          ];
        }

        case "Ready": {
          const [pageNew, pageCmd, actions] = Pages.updateReady(
            status.profile,
            msg,
            model.page
          );

          return [
            { ...model, page: pageNew },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            actions,
          ];
        }
      }
    }

    case "Route": {
      const route = msg.route;

      const status = toStatus(model);

      switch (status.type) {
        case "ProfileLoading":
          return [model, cmd.none, []];

        case "ProfileMissing": {
          const [page, pageCmd] = Pages.initProfileMissing(
            route,
            status.session
          );

          return [
            { ...model, page },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            [],
          ];
        }

        case "Ready": {
          const [page, pageCmd] = Pages.initReady(route, status.profile);
          return [
            { ...model, page },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            [],
          ];
        }

        case "SessionLoading":
          return [model, cmd.none, []];

        case "SessionMissing": {
          const [page, pageCmd] = Pages.initSessionMissing(route);
          return [
            { ...model, page },
            pipe(pageCmd, cmd.map(groupTag("Page"))),
            [],
          ];
        }
      }
    }

    default:
      return exhaustive(msg);
  }
};

const updateActions = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  const { group } = msg;

  switch (group) {
    case "Store":
      const [storeNew, storeCmd] = Store.update(msg, model.store);
      return [
        { ...model, store: storeNew },
        pipe(storeCmd, cmd.map(groupTag("Store"))),
      ];

    case "Page":
      return [model, cmd.none];

    case "Session":
      return [model, cmd.none];

    case "Snackbar":
      return [model, cmd.none];

    case "Game":
      const [gameNew, gameCmd, actions] = Games.update(msg, model.game);
      return pipe(
        [{ ...model, game: gameNew }, pipe(gameCmd, cmd.map(groupTag("Game")))],
        andThenMany(updateActions, actions)
      );

    case "Route":
      return [model, cmd.none];

    default:
      return exhaustive(group);
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  return sub.batch<Msg>([
    pipe(Route.subscriptions(), sub.map(groupTag("Route"))),
    pipe(Session.subscriptions, sub.map(groupTag("Session"))),
  ]);
};

// const navigationSubscrption: sub.Sub<Msg> = pipe(
//   Navigation.subscription,
//   sub.map((location) => ({
//     type: "RecievedLocation",
//     location,
//     group: "Location",
//   }))
// );

// const sessionSubcription = (): sub.Sub<Msg> => {
//   return pipe(
//     Session.subscription,
//     sub.map((session) => ({
//       type: "RecievedSession",
//       session,
//       group: "Session",
//     }))
//   );
// };

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): View.ThemeMode => {
  const status = toStatus(model);

  switch (status.type) {
    case "SessionLoading":
    case "SessionMissing":
    case "ProfileLoading":
    case "ProfileMissing":
      return "Dark";
    case "Ready":
      return status.profile.themeMode;
  }
};

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.ThemeProvider themeMode={toThemeMode(model)}>
        <View.Box
          sx={{
            maxWidth: "sm",
            marginX: "auto",
            position: "fixed",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <View.Box sx={{ width: "100%", flex: 1 }}>
            {viewMain(model)(dispatch)}
          </View.Box>

          {viewSnackbar(model)(dispatch)}
        </View.Box>
      </View.ThemeProvider>
    );

const viewMain = (model: Model): View.View<Msg> => {
  const status = toStatus(model);

  switch (status.type) {
    case "SessionLoading":
      return viewLoading;

    case "ProfileLoading":
      return viewLoading;

    case "SessionMissing":
      return pipe(
        Pages.viewSessionMissing(model.page),
        View.map(groupTag("Page"))
      );

    case "ProfileMissing":
      return pipe(
        Pages.viewProfileMissing(status.session, model.page),
        View.map(groupTag("Page"))
      );

    case "Ready":
      return pipe(
        Pages.viewReady(
          { profile: status.profile, game: model.game },
          model.page
        ),
        View.map(groupTag("Page"))
      );
  }
};

const viewLoading: View.View<Msg> = () => <View.LoadingPage />;

const viewSnackbar =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    switch (model.game.type) {
      case "Closed":
        return (
          <>
            {pipe(
              Snackbar.view({}, model.snackbar),
              View.map(groupTag("Snackbar"))
            )(dispatch)}
          </>
        );

      case "Opened":
        return (
          <>
            {pipe(
              Snackbar.view({ sx: { bottom: 80 } }, model.snackbar),
              View.map(groupTag("Snackbar"))
            )(dispatch)}

            {pipe(
              Games.viewBanner(model.game),
              View.map(groupTag("Game"))
            )(dispatch)}
          </>
        );
    }
  };

//
//
//
// Main
//
//
//

const flags: Flags = {
  location: Navigation.getLocation(),
};

const program = programWithDebugger(init(flags), update, view, subscriptions);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root dom node");
}

const root = ReactDom.createRoot(rootElement);

html.run(program, (dom) => {
  root.render(dom);
});
