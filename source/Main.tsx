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
  route: Route.Model;
  page: Pages.Model;
};

type Status =
  | { type: "SessionLoading" }
  | { type: "SessionMissing" }
  | { type: "ProfileLoading" }
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
          return { type: "SessionLoading" };

        case "Loading":
          return { type: "SessionLoading" };

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
  const [page, pageCmd] = Pages.initSessionMissing(route);

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

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  const [modelNew, cmdNew, actions] = updateMain(msg, model);

  const statusPrev = toStatus(model);
  const statusNew = toStatus(modelNew);

  return pipe([modelNew, cmdNew], andThenMany(updateActions, actions));
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

    case "Session":
      const sessionNew = Session.update(msg);
      const modelNew = { ...model, session: sessionNew };

      switch (sessionNew.type) {
        case "Loading":
          return [modelNew, cmd.none, []];

        case "LoggedOut":
          return [modelNew, cmd.none, []];

        case "LoggedIn":
          return [modelNew, cmd.none, [Store.Profile.Get(sessionNew.userId)]];
      }

    case "Snackbar":
      return [{ ...model }, cmd.none, []];

    case "Game":
      return [{ ...model }, cmd.none, []];

    case "Route": {
      const status = toStatus(model);

      return [{ ...model }, cmd.none, []];
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
      return [model, cmd.none];

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
  return sub.batch([pipe(Route.subscriptions(), sub.map(groupTag("Route")))]);
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
        Pages.view({ profile: status.profile, game: model.game }, model.page),
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
