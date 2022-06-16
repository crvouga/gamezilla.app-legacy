import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, html, sub, task } from "Framework";
import { Cmd } from "Framework/Cmd";
import { programWithDebugger } from "Framework/Debug/Html";
import * as Navigation from "Framework/Navigation";
import * as Games from "Games";
import * as Pages from "Pages";
import * as Store from "Store";
import * as Profile from "Store/Profile";
import * as ReactDom from "react-dom/client";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import { andThen, andThenMany, exhaustive, groupTag } from "Utility";
import * as View from "View";

//
//
//
// Model
//
//
//

type Model = SessionLoading | SessionMissing | Ready;

type SessionLoading = {
  type: "SessionLoading";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  store: Store.Model;
};

type SessionMissing = {
  type: "SessionMissing";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  store: Store.Model;
  page: SessionMissingPage;
};

type SessionMissingPage = { type: "Login"; child: Pages.Login.Model };

type Ready = {
  type: "Ready";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  store: Store.Model;
  session: Session.Session;
  game: Games.Model;
  page: ReadyPage | ProfileMissingPage | ProfileLoadingPage;
};

type ProfileLoadingPage = { type: "Loading" };

type ProfileMissingPage =
  | { type: "ProfileCreate"; child: Pages.ProfileCreate.Model }
  | { type: "Logout"; child: Pages.Logout.Model };

type ReadyPage =
  | { type: "Game" }
  | { type: "Home"; child: Pages.Home.Model }
  | { type: "Account"; child: Pages.Account.Model }
  | { type: "Logout"; child: Pages.Logout.Model }
  | { type: "ProfileDelete"; child: Pages.ProfileDelete.Model }
  | { type: "ProfileUpdate"; child: Pages.ProfileUpdate.Model }
  | { type: "ProfileUpdateAvatar"; child: Pages.ProfileUpdateAvatar.Model }
  | { type: "ProfileUpdateName"; child: Pages.ProfileUpdateName.Model }
  | {
      type: "ProfileUpdateUsername";
      child: Pages.ProfileUpdateUsername.Model;
    }
  | { type: "ProfileUpdateTheme"; child: Pages.ProfileUpdateTheme.Model }
  | { type: "Chat"; child: Pages.Chat.Model }
  | { type: "ChatNew"; child: Pages.ChatNew.Model };

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
  return initSessionLoading(flags);
};

//
//
//
// Msg
//
//
//

export type Msg =
  | {
      type: "RecievedLocation";
      location: Navigation.Location;
      group: "Location";
    }
  | {
      type: "RecievedSession";
      session: option.Option<Session.Session>;
      group: "Session";
    }
  | OutMsg
  | PageMsg;

type OutMsg = Snackbar.GroupedMsg | Games.GroupedMsg | Store.GroupedMsg;

type PageMsg =
  | (Pages.Account.Msg & { group: "Account" })
  | (Pages.Home.Msg & { group: "Home" })
  | (Pages.Login.Msg & { group: "Login" })
  | (Pages.Logout.Msg & { group: "Logout" })
  | (Pages.ProfileCreate.Msg & { group: "ProfileCreate" })
  | (Pages.ProfileDelete.Msg & { group: "ProfileDelete" })
  | (Pages.ProfileUpdate.Msg & { group: "ProfileUpdate" })
  | (Pages.ProfileUpdateAvatar.Msg & { group: "ProfileUpdateAvatar" })
  | (Pages.ProfileUpdateName.Msg & { group: "ProfileUpdateName" })
  | (Pages.ProfileUpdateUsername.Msg & { group: "ProfileUpdateUsername" })
  | (Pages.Chat.Msg & { group: "Chat" })
  | (Pages.ChatNew.Msg & { group: "ChatNew" })
  | (Pages.ProfileUpdateTheme.Msg & { group: "ProfileUpdateTheme" });

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  const [model_, cmd_] = updateStore(msg, model);

  const [modelPrev, cmdPrev, outMsgs] = updateMain(msg, model_);

  const [modelNew, cmdNew] = pipe(
    [modelPrev, cmdPrev],
    andThenMany(updateShared, [msg, ...outMsgs])
  );

  return [modelNew, cmd.batch([cmdNew, cmd_])];
};

const updateShared = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  return pipe(
    [model, cmd.none],
    andThen(updateGame, msg),
    andThen(updateSnackbar, msg),
    andThen(updateStore, msg)
  );
};

const updateGame = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  if (msg.group === "Game" && model.type === "Ready") {
    const [gameModel, gameCmd, outMsgs] = Games.update(msg, model.game);

    return pipe(
      [{ ...model, game: gameModel }, pipe(gameCmd, cmd.map(groupTag("Game")))],
      andThenMany(updateSnackbar, outMsgs)
    );
  }

  return [model, cmd.none];
};

const updateSnackbar = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  if (msg.group === "Snackbar") {
    const [snackbarModel, snackbarCmd] = Snackbar.update(msg, model.snackbar);
    return [
      { ...model, snackbar: snackbarModel },
      pipe(snackbarCmd, cmd.map(groupTag("Snackbar"))),
    ];
  }

  return [model, cmd.none];
};

const updateStore = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  if (msg.group === "Store") {
    const [storeModel, storeCmd] = Store.update(msg, model.store);
    return [
      { ...model, store: storeModel },
      pipe(storeCmd, cmd.map(groupTag("Store"))),
    ];
  }

  return [model, cmd.none];
};

const updateMain = (msg: Msg, model: Model): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (model.type) {
    case "SessionLoading":
      return updateSessionLoading(msg, model);

    case "Ready":
      return updateReady(msg, model);

    case "SessionMissing":
      return updateSessionMissing(msg, model);
  }
};

const updateProfileMissingPage = (
  { session }: { session: Session.Session },
  msg: Msg,
  page: ProfileMissingPage
): [ProfileMissingPage, Cmd<Msg>, OutMsg[]] => {
  if (page.type === "Logout" && msg.group === "Logout") {
    const [child, childCmd, outMsgs] = Pages.Logout.update(
      { name: session.defaultName },
      msg,
      page.child
    );
    return [
      { type: "Logout", child },
      pipe(childCmd, cmd.map(groupTag("Logout"))),
      outMsgs,
    ];
  }

  if (page.type === "ProfileCreate" && msg.group === "ProfileCreate") {
    const [child, childCmd] = Pages.ProfileCreate.update(
      session,
      msg,
      page.child
    );
    return [
      { type: "ProfileCreate", child },
      pipe(childCmd, cmd.map(groupTag("ProfileCreate"))),
      [],
    ];
  }

  return [page, cmd.none, []];
};

const updateSessionMissing = (
  msg: Msg,
  model: SessionMissing
): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "RecievedSession":
      if (option.isNone(msg.session)) {
        return [model, cmd.none, []];
      }

      return initReady({ ...model, session: msg.session.value });

    default:
      const [modelPage, cmdPage] = updateSessionMissingPage(msg, model.page);

      return [{ ...model, page: modelPage }, cmdPage, []];
  }
};

const updateSessionMissingPage = (
  msg: Msg,
  page: SessionMissingPage
): [SessionMissingPage, Cmd<Msg>] => {
  switch (page.type) {
    case "Login":
      if (msg.group === "Login") {
        const [child, childCmd] = Pages.Login.update(msg, page.child);
        return [
          { type: "Login", child },
          pipe(childCmd, cmd.map(groupTag("Login"))),
        ];
      }

      return [page, cmd.none];
  }
};

const updateSessionLoading = (
  msg: Msg,
  model: SessionLoading
): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "RecievedSession":
      if (option.isNone(msg.session)) {
        return initSessionMissing(model, []);
      }

      return initReady({ ...model, session: msg.session.value });

    default:
      return [model, cmd.none, []];
  }
};

const updateReady = (msg: Msg, model: Ready): [Model, Cmd<Msg>, OutMsg[]] => {
  const storeData = Store.toProfile(model.store, model.session.userId);

  if (msg.type === "RecievedSession") {
    return initSessionMissing(model, []);
  }

  switch (storeData.type) {
    case "Failure": {
      if (msg.type === "RecievedLocation") {
        const [page, pageCmd] = initProfileMissingPage({
          ...model,
          location: msg.location,
        });

        return [{ ...model, location: msg.location, page }, pageCmd, []];
      }

      if (model.page.type === "ProfileCreate" || model.page.type === "Logout") {
        const [page, pageCmd, outMsgs] = updateProfileMissingPage(
          model,
          msg,
          model.page
        );

        return [{ ...model, page }, pageCmd, outMsgs];
      }

      const [page, pageCmd] = initProfileMissingPage(model);

      return [{ ...model, page }, pageCmd, []];
    }

    case "Loading":
      return [model, cmd.none, []];

    case "NotAsked":
      return [model, cmd.none, []];

    case "Success":
      const profile = storeData.value;

      if (msg.type === "RecievedLocation") {
        const [page, pageCmd] = initReadyPage({
          profile,
          location: msg.location,
        });

        return [{ ...model, location: msg.location, page }, pageCmd, []];
      }

      if (
        model.page.type === "ProfileCreate" ||
        model.page.type === "Loading"
      ) {
        const [page, pageCmd] = initReadyPage({
          profile,
          location: model.location,
        });

        return [{ ...model, page }, pageCmd, []];
      }

      const [page, pageCmd, outMsgs] = updateReadyPage(
        { profile },
        msg,
        model.page
      );

      return [{ ...model, page }, pageCmd, outMsgs];
  }
};

const updateReadyPage = (
  { profile }: { profile: Profile.Profile },
  msg: Msg,
  page: ReadyPage
): [ReadyPage, Cmd<Msg>, OutMsg[]] => {
  const fallback: [ReadyPage, Cmd<Msg>, OutMsg[]] = [page, cmd.none, []];

  switch (page.type) {
    case "Account":
      if (msg.group === "Account") {
        const [child, childCmd] = Pages.Account.update(
          profile,
          msg,
          page.child
        );
        return [
          { type: "Account", child },
          pipe(childCmd, cmd.map(groupTag("Account"))),
          [],
        ];
      }
      return fallback;

    case "Home":
      if (msg.group === "Home") {
        const [child, childCmd, outMsgs] = Pages.Home.update(msg, page.child);
        return [
          { type: "Home", child },
          pipe(childCmd, cmd.map(groupTag("Home"))),
          outMsgs,
        ];
      }
      return fallback;

    case "Logout":
      if (msg.group === "Logout") {
        const [child, childCmd, outMsgs] = Pages.Logout.update(
          { name: profile.username },
          msg,
          page.child
        );
        return [
          { type: "Logout", child },
          pipe(childCmd, cmd.map(groupTag("Logout"))),
          outMsgs,
        ];
      }
      return fallback;

    case "ProfileDelete":
      if (msg.group === "ProfileDelete") {
        const [child, childCmd, actions] = Pages.ProfileDelete.update(
          profile,
          msg,
          page.child
        );
        return [
          { type: "ProfileDelete", child },
          pipe(childCmd, cmd.map(groupTag("ProfileDelete"))),
          actions,
        ];
      }
      return fallback;

    case "ProfileUpdate":
      if (msg.group === "ProfileUpdate") {
        const [child, childCmd] = Pages.ProfileUpdate.update(
          profile,
          msg,
          page.child
        );
        return [
          { type: "ProfileUpdate", child },
          pipe(childCmd, cmd.map(groupTag("ProfileUpdate"))),
          [],
        ];
      }
      return fallback;

    case "ProfileUpdateAvatar":
      if (msg.group === "ProfileUpdateAvatar") {
        const [child, childCmd, outMsgs] = Pages.ProfileUpdateAvatar.update(
          { userId: profile.userId },
          msg,
          page.child
        );
        return [
          { type: "ProfileUpdateAvatar", child },
          pipe(childCmd, cmd.map(groupTag("ProfileUpdateAvatar"))),
          outMsgs,
        ];
      }
      return fallback;

    case "ProfileUpdateName":
      if (msg.group === "ProfileUpdateName") {
        const [child, childCmd, outMsgs] = Pages.ProfileUpdateName.update(
          profile,
          msg,
          page.child
        );
        return [
          { type: "ProfileUpdateName", child },
          pipe(childCmd, cmd.map(groupTag("ProfileUpdateName"))),
          outMsgs,
        ];
      }
      return fallback;

    case "ProfileUpdateUsername":
      if (msg.group === "ProfileUpdateUsername") {
        const [child, childCmd, msgs] = Pages.ProfileUpdateUsername.update(
          profile,
          msg,
          page.child
        );
        return [
          { type: "ProfileUpdateUsername", child },
          pipe(childCmd, cmd.map(groupTag("ProfileUpdateUsername"))),
          msgs,
        ];
      }
      return fallback;

    case "Game":
      if (msg.group === "Game") {
        return [page, cmd.none, []];
      }
      return fallback;

    case "Chat":
      if (msg.group === "Chat") {
        const [child, childCmd] = Pages.Chat.update(msg, page.child);
        return [
          { type: "Chat", child },
          pipe(childCmd, cmd.map(groupTag("Chat"))),
          [],
        ];
      }
      return fallback;

    case "ChatNew":
      if (msg.group === "ChatNew") {
        const [child, childCmd] = Pages.ChatNew.update(msg, page.child);

        return [
          { type: "ChatNew", child },
          pipe(childCmd, cmd.map(groupTag("ChatNew"))),
          [],
        ];
      }

      return fallback;

    case "ProfileUpdateTheme":
      if (msg.group === "ProfileUpdateTheme") {
        const [child, childCmd, actions] = Pages.ProfileUpdateTheme.update(
          profile,
          msg,
          page.child
        );

        return [
          { type: "ProfileUpdateTheme", child },
          pipe(childCmd, cmd.map(groupTag("ProfileUpdateTheme"))),
          actions,
        ];
      }

      return fallback;

    default:
      return exhaustive(page);
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
  switch (model.type) {
    case "Ready":
      return sub.batch([
        navigationSubscrption,
        sessionSubcription(),
        pipe(Games.subscriptions(model.game), sub.map(groupTag("Game"))),
      ]);

    case "SessionLoading":
      return sub.batch([navigationSubscrption, sessionSubcription()]);

    case "SessionMissing":
      return sub.batch([navigationSubscrption, sessionSubcription()]);
  }
};

const navigationSubscrption: sub.Sub<Msg> = pipe(
  Navigation.subscription,
  sub.map((location) => ({
    type: "RecievedLocation",
    location,
    group: "Location",
  }))
);

const sessionSubcription = (): sub.Sub<Msg> => {
  return pipe(
    Session.subscription,
    sub.map((session) => ({
      type: "RecievedSession",
      session,
      group: "Session",
    }))
  );
};

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): View.ThemeMode => {
  const fallback: View.ThemeMode = "Dark";

  switch (model.type) {
    case "SessionLoading":
    case "SessionMissing":
      return fallback;

    case "Ready":
      const remoteData = Store.toProfile(model.store, model.session.userId);

      switch (remoteData.type) {
        case "Failure":
        case "Loading":
        case "NotAsked":
          return fallback;

        case "Success":
          return remoteData.value.themeMode;
      }
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

          {model.type === "Ready" &&
          model.page.type !== "Game" &&
          model.game.type === "Opened" ? (
            <>
              <View.Divider />

              {pipe(
                Snackbar.view({ sx: { bottom: 80 } }, model.snackbar),
                View.map(groupTag("Snackbar"))
              )(dispatch)}

              {pipe(
                Games.viewBanner(model.game),
                View.map(groupTag("Game"))
              )(dispatch)}
            </>
          ) : (
            <>
              {pipe(
                Snackbar.view({}, model.snackbar),
                View.map(groupTag("Snackbar"))
              )(dispatch)}
            </>
          )}
        </View.Box>
      </View.ThemeProvider>
    );

const viewMain = (model: Model): View.View<Msg> => {
  switch (model.type) {
    case "SessionLoading":
      return viewSessionLoading(model);

    case "SessionMissing":
      return viewSessionMissing(model);

    case "Ready":
      return viewReady(model);
  }
};

const viewLoading: View.View<Msg> = () => <View.LoadingPage />;

const viewProfileMissing = (page: ProfileMissingPage): View.View<Msg> => {
  switch (page.type) {
    case "Logout":
      return pipe(Pages.Logout.view(page.child), View.map(groupTag("Logout")));

    case "ProfileCreate":
      return pipe(
        Pages.ProfileCreate.view(page.child),
        View.map(groupTag("ProfileCreate"))
      );

    default:
      return exhaustive(page);
  }
};

const viewSessionLoading = (model: SessionLoading): View.View<Msg> => {
  return () => <View.LoadingPage />;
};

const viewSessionMissing = (model: SessionMissing): View.View<Msg> => {
  switch (model.page.type) {
    case "Login":
      return pipe(
        Pages.Login.view(model.page.child),
        View.map(groupTag("Login"))
      );

    default:
      return exhaustive(model.page.type);
  }
};

const viewReady = (model: Ready): View.View<Msg> => {
  const storeData = Store.toProfile(model.store, model.session.userId);

  switch (storeData.type) {
    case "NotAsked":
      return viewLoading;

    case "Loading":
      return viewLoading;

    case "Failure":
      if (model.page.type === "Logout" || model.page.type === "ProfileCreate") {
        return viewProfileMissing(model.page);
      }

      return viewLoading;

    case "Success":
      const profile = storeData.value;

      return viewProfileFound(profile, model);
  }
};

const viewProfileFound = (
  profile: Profile.Profile,
  { page, game }: Ready
): View.View<Msg> => {
  switch (page.type) {
    case "Account":
      return pipe(
        Pages.Account.view(profile, page.child),
        View.map(groupTag("Account"))
      );

    case "Home":
      return pipe(
        Pages.Home.view({ profile, game }, page.child),
        View.map(groupTag("Home"))
      );

    case "Logout":
      return pipe(Pages.Logout.view(page.child), View.map(groupTag("Logout")));

    case "ProfileDelete":
      return pipe(
        Pages.ProfileDelete.view(page.child),
        View.map(groupTag("ProfileDelete"))
      );

    case "ProfileUpdate":
      return pipe(
        Pages.ProfileUpdate.view(profile, page.child),
        View.map(groupTag("ProfileUpdate"))
      );

    case "ProfileUpdateAvatar":
      return pipe(
        Pages.ProfileUpdateAvatar.view(page.child),
        View.map(groupTag("ProfileUpdateAvatar"))
      );

    case "ProfileUpdateName":
      return pipe(
        Pages.ProfileUpdateName.view(page.child),
        View.map(groupTag("ProfileUpdateName"))
      );

    case "ProfileUpdateUsername":
      return pipe(
        Pages.ProfileUpdateUsername.view(page.child),
        View.map(groupTag("ProfileUpdateUsername"))
      );

    case "Game":
      return pipe(Games.view(game), View.map(groupTag("Game")));

    case "Chat":
      return pipe(Pages.Chat.view(page.child), View.map(groupTag("Chat")));

    case "ChatNew":
      return pipe(
        Pages.ChatNew.view(page.child),
        View.map(groupTag("ChatNew"))
      );

    case "ProfileUpdateTheme":
      return pipe(
        Pages.ProfileUpdateTheme.view(profile, page.child),
        View.map(groupTag("ProfileUpdateTheme"))
      );

    case "ProfileCreate":
      return pipe(
        Pages.ProfileCreate.view(page.child),
        View.map(groupTag("ProfileCreate"))
      );

    case "Loading":
      return viewLoading;

    default:
      return exhaustive(page);
  }
};

//
//
//
//
// Helpers
//
//
//
//

const initSessionLoading = ({
  location,
}: {
  location: Navigation.Location;
}): [SessionLoading, Cmd<Msg>] => {
  return [
    {
      type: "SessionLoading",
      location: location,
      snackbar: Snackbar.init,
      store: Store.init,
    },
    pipe(
      Session.load,
      task.perform((session) => ({
        type: "RecievedSession",
        session,
        group: "Session",
      }))
    ),
  ];
};

const initSessionMissing = (
  {
    location,
    snackbar,
    store,
  }: {
    snackbar: Snackbar.Model;
    location: Navigation.Location;
    store: Store.Model;
  },
  outMsgs: OutMsg[]
): [SessionMissing, Cmd<Msg>, OutMsg[]] => {
  const child = Pages.Login.init;

  return [
    {
      type: "SessionMissing",
      snackbar,
      location,
      store,
      page: { type: "Login", child },
    },
    Navigation.push(Route.encode({ type: "Login" })),
    outMsgs,
  ];
};

const initProfileMissingPage = ({
  location,
  session,
}: {
  session: Session.Session;
  location: Navigation.Location;
}): [ProfileMissingPage, Cmd<Msg>] => {
  const route = pipe(
    location.pathname,
    Route.decode,
    option.fold<Route.Route, Route.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [ProfileMissingPage, Cmd<Msg>] = [
    { type: "ProfileCreate", child: Pages.ProfileCreate.init(session) },
    Navigation.push(Route.encode({ type: "ProfileCreate" })),
  ];

  switch (route.type) {
    case "ProfileCreate":
      return [
        { type: "ProfileCreate", child: Pages.ProfileCreate.init(session) },
        cmd.none,
      ];

    case "Logout":
      return [{ type: "Logout", child: Pages.Logout.init }, cmd.none];

    default:
      return notFound;
  }
};

const initReady = ({
  location,
  snackbar,
  session,
  store,
}: {
  location: Navigation.Location;
  snackbar: Snackbar.Model;

  store: Store.Model;
  session: Session.Session;
}): [Ready, Cmd<Msg>, OutMsg[]] => {
  const partial = {
    type: "Ready",
    location,
    snackbar,
    session,
    store,
    game: Games.init,
  } as const;

  const storeData = Store.toProfile(store, session.userId);
  switch (storeData.type) {
    case "Failure": {
      const [page, pageCmd] = initProfileMissingPage({ location, session });

      return [{ ...partial, page }, pageCmd, []];
    }

    case "Loading":
      return [{ ...partial, page: { type: "Loading" } }, cmd.none, []];

    case "NotAsked":
      return [
        { ...partial, page: { type: "Loading" } },
        cmd.none,
        [Store.Profile.Get(session.userId)],
      ];

    case "Success":
      const profile = storeData.value;

      const [page, pageCmd] = initReadyPage({ profile, location });

      return [
        { ...partial, page: page },
        pageCmd,
        [Snackbar.EnqueuedSnackbar(`Signed in as ${profile.username}.`)],
      ];
  }
};

const initReadyPage = ({
  profile,
  location,
}: {
  profile: Profile.Profile;
  location: Navigation.Location;
}): [ReadyPage, Cmd<Msg>] => {
  const route = pipe(
    location.pathname,
    Route.decode,
    option.fold<Route.Route, Route.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [ReadyPage, Cmd<Msg>] = [
    { type: "Home", child: Pages.Home.init },
    Navigation.push(Route.encode({ type: "Home" })),
  ];

  switch (route.type) {
    case "Account":
      return [{ type: "Account", child: Pages.Account.init }, cmd.none];

    case "Home":
      return [{ type: "Home", child: Pages.Home.init }, cmd.none];

    case "Login":
      return notFound;

    case "Logout":
      return [{ type: "Logout", child: Pages.Logout.init }, cmd.none];

    case "NotFound":
      return notFound;

    case "ProfileCreate":
      return notFound;

    case "ProfileDelete":
      return [
        { type: "ProfileDelete", child: Pages.ProfileDelete.init },
        cmd.none,
      ];

    case "ProfileUpdate":
      return [
        { type: "ProfileUpdate", child: Pages.ProfileUpdate.init },
        cmd.none,
      ];

    case "ProfileUpdateAvatar":
      return [
        {
          type: "ProfileUpdateAvatar",
          child: Pages.ProfileUpdateAvatar.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateName":
      return [
        {
          type: "ProfileUpdateName",
          child: Pages.ProfileUpdateName.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateUsername":
      return [
        {
          type: "ProfileUpdateUsername",
          child: Pages.ProfileUpdateUsername.init(profile),
        },
        cmd.none,
      ];

    case "Game":
      return [{ type: "Game" }, cmd.none];

    case "Chat":
      return [{ type: "Chat", child: Pages.Chat.init }, cmd.none];

    case "ChatNew":
      const [modelChild, cmdChild] = Pages.ChatNew.init();
      return [
        { type: "ChatNew", child: modelChild },
        pipe(cmdChild, cmd.map(groupTag("ChatNew"))),
      ];

    case "ProfileUpdateTheme": {
      return [
        { type: "ProfileUpdateTheme", child: Pages.ProfileUpdateTheme.init },
        cmd.none,
      ];
    }

    default:
      return exhaustive(route);
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
