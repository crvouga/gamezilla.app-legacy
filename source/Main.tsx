import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { html, cmd, sub, task } from "Framework";
import { Cmd } from "Framework/Cmd";
import { programWithDebugger } from "Framework/Debug/Html";
import * as ReactDom from "react-dom/client";
import * as Game from "Game";
import * as Navigation from "Navigation";
import * as Pages from "Pages";
import * as Profile from "Profile";
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

type Model =
  | SessionLoading
  | SessionMissing
  | ProfileLoading
  | ProfileMissing
  | Ready;

type SessionLoading = {
  type: "SessionLoading";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
};

type SessionMissing = {
  type: "SessionMissing";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  page: SessionMissingPage;
};

type SessionMissingPage = { type: "Login"; child: Pages.Login.Model };

type ProfileLoading = {
  type: "ProfileLoading";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
};

type ProfileMissing = {
  type: "ProfileMissing";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
  page: ProfileMissingPage;
};

type ProfileMissingPage =
  | { type: "ProfileCreate"; child: Pages.ProfileCreate.Model }
  | { type: "Logout"; child: Pages.Logout.Model };

type Ready = {
  type: "Ready";
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  profile: Profile.Profile;
  session: Session.Session;
  game: Game.Model;
  page: ReadyPage;
};

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
  | {
      type: "RecievedProfile";
      profile: option.Option<Profile.Profile>;
      group: "Profile";
    }
  | OutMsg
  | PageMsg;

type OutMsg = Snackbar.GroupedMsg | Game.GroupedMsg;

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
  | (Pages.ChatNew.Msg & { group: "ChatNew" });

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  const [modelPrev, cmdPrev, outMsgs] = updateMain(msg, model);

  const [modelNew, cmdNew] = pipe(
    [modelPrev, cmdPrev],
    andThenMany(updateShared, [msg, ...outMsgs])
  );

  return [modelNew, cmdNew];
};

const updateShared = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  return pipe(
    [model, cmd.none],
    andThen(updateGame, msg),
    andThen(updateSnackbar, msg)
  );
};

const updateGame = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  if (msg.group === "Game" && model.type === "Ready") {
    const [gameModel, gameCmd, outMsgs] = Game.update(msg, model.game);

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

const updateMain = (msg: Msg, model: Model): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (model.type) {
    case "SessionLoading":
      return updateSessionLoading(msg, model);

    case "ProfileLoading":
      return updateProfileLoading(msg, model);

    case "ProfileMissing":
      return updateProfileMissing(msg, model);

    case "Ready":
      return updateReady(msg, model);

    case "SessionMissing":
      return updateSessionMissing(msg, model);
  }
};

const updateProfileMissing = (
  msg: Msg,
  model: ProfileMissing
): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "RecievedLocation": {
      const [page, pageCmd] = initProfileMissingPage({
        session: model.session,
        location: msg.location,
      });

      return [{ ...model, location: msg.location, page }, pageCmd, []];
    }

    case "RecievedProfile":
      if (option.isNone(msg.profile)) {
        return [model, cmd.none, []];
      }

      return initReady({ ...model, profile: msg.profile.value });

    case "RecievedSession":
      if (option.isNone(msg.session)) {
        return initSessionMissing(model, [
          Snackbar.EnqueuedSnackbar(
            `Logged out of ${model.session.defaultName}`
          ),
        ]);
      }

      return [{ ...model, session: msg.session.value }, cmd.none, []];

    default:
      const [modelPage, cmdPage] = updateProfileMissingPage(
        model,
        msg,
        model.page
      );
      return [{ ...model, page: modelPage }, cmdPage, []];
  }
};

const updateProfileMissingPage = (
  model: ProfileMissing,
  msg: Msg,
  page: ProfileMissingPage
): [ProfileMissingPage, Cmd<Msg>, OutMsg[]] => {
  if (page.type === "Logout" && msg.group === "Logout") {
    const [child, childCmd, outMsgs] = Pages.Logout.update(
      { name: model.session.defaultName },
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
      model.session,
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

      return initProfileLoading({ ...model, session: msg.session.value });

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

      return initProfileLoading({ ...model, session: msg.session.value });

    default:
      return [model, cmd.none, []];
  }
};

const updateProfileLoading = (
  msg: Msg,
  model: ProfileLoading
): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "RecievedProfile":
      if (option.isNone(msg.profile)) {
        return initProfileMissing(model);
      }

      return initReady({ ...model, profile: msg.profile.value });

    default:
      return [model, cmd.none, []];
  }
};

const updateReady = (msg: Msg, model: Ready): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "RecievedLocation": {
      const [page, pageCmd] = initReadyPage({
        profile: model.profile,
        location: msg.location,
      });

      return [{ ...model, location: msg.location, page }, pageCmd, []];
    }

    case "RecievedProfile":
      if (option.isNone(msg.profile)) {
        return initProfileMissing(model);
      }

      return [{ ...model, profile: msg.profile.value }, cmd.none, []];

    case "RecievedSession":
      if (option.isNone(msg.session)) {
        return initSessionMissing(model, []);
      }

      return [{ ...model, session: msg.session.value }, cmd.none, []];

    default:
      const [modelPage, cmdPage, msgs] = updateReadyPage(
        model,
        msg,
        model.page
      );
      return [{ ...model, page: modelPage }, cmdPage, msgs];
  }
};

const updateReadyPage = (
  { profile }: { profile: Profile.Profile; location: Navigation.Location },
  msg: Msg,
  page: Ready["page"]
): [Ready["page"], Cmd<Msg>, OutMsg[]] => {
  if (page.type === "Account" && msg.group === "Account") {
    const [child, childCmd] = Pages.Account.update(profile, msg, page.child);
    return [
      { type: "Account", child },
      pipe(childCmd, cmd.map(groupTag("Account"))),
      [],
    ];
  }

  if (page.type === "Home" && msg.group === "Home") {
    const [child, childCmd, outMsgs] = Pages.Home.update(msg, page.child);
    return [
      { type: "Home", child },
      pipe(childCmd, cmd.map(groupTag("Home"))),
      outMsgs,
    ];
  }

  if (page.type === "Logout" && msg.group === "Logout") {
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

  if (page.type === "ProfileDelete" && msg.group === "ProfileDelete") {
    const [child, childCmd] = Pages.ProfileDelete.update(
      profile,
      msg,
      page.child
    );
    return [
      { type: "ProfileDelete", child },
      pipe(childCmd, cmd.map(groupTag("ProfileDelete"))),
      [],
    ];
  }

  if (page.type === "ProfileUpdate" && msg.group === "ProfileUpdate") {
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

  if (
    page.type === "ProfileUpdateAvatar" &&
    msg.group === "ProfileUpdateAvatar"
  ) {
    const [child, childCmd, msgs] = Pages.ProfileUpdateAvatar.update(
      { userId: profile.userId },
      msg,
      page.child
    );
    return [
      { type: "ProfileUpdateAvatar", child },
      pipe(childCmd, cmd.map(groupTag("ProfileUpdateAvatar"))),
      msgs.map(groupTag("Snackbar")),
    ];
  }

  if (page.type === "ProfileUpdateName" && msg.group === "ProfileUpdateName") {
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

  if (
    page.type === "ProfileUpdateUsername" &&
    msg.group === "ProfileUpdateUsername"
  ) {
    const [child, childCmd, msgs] = Pages.ProfileUpdateUsername.update(
      profile,
      msg,
      page.child
    );
    return [
      { type: "ProfileUpdateUsername", child },
      pipe(childCmd, cmd.map(groupTag("ProfileUpdateUsername"))),
      msgs.map(groupTag("Snackbar")),
    ];
  }

  if (page.type === "Game" && msg.group === "Game") {
    return [page, cmd.none, []];
  }

  if (page.type === "Chat" && msg.group === "Chat") {
    const [child, childCmd] = Pages.Chat.update(msg, page.child);
    return [
      { type: "Chat", child },
      pipe(childCmd, cmd.map(groupTag("Chat"))),
      [],
    ];
  }

  if (page.type === "ChatNew" && msg.group === "ChatNew") {
    const [child, childCmd] = Pages.ChatNew.update(msg, page.child);

    return [
      { type: "ChatNew", child },
      pipe(childCmd, cmd.map(groupTag("ChatNew"))),
      [],
    ];
  }

  return [page, cmd.none, []];
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
    case "ProfileLoading":
      return sub.batch([navigationSubscrption, sessionSubcription()]);

    case "ProfileMissing":
      return sub.batch([
        navigationSubscrption,
        sessionSubcription(),
        profileSubscription(model.session),
      ]);

    case "Ready":
      return sub.batch([
        navigationSubscrption,
        sessionSubcription(),
        profileSubscription(model.profile),
        pipe(Game.subscriptions(model.game), sub.map(groupTag("Game"))),
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

const profileSubscription = ({ userId }: { userId: string }): sub.Sub<Msg> => {
  return pipe(
    Profile.subscription({ userId }),
    sub.map((profile) => ({
      type: "RecievedProfile",
      profile,
      group: "Profile",
    }))
  );
};

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

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.ThemeProvider>
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
                Game.viewBanner(model.game),
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
    case "ProfileLoading":
      return viewProfileLoading(model);

    case "ProfileMissing":
      return viewProfileMissing(model);

    case "SessionLoading":
      return viewSessionLoading(model);

    case "SessionMissing":
      return viewSessionMissing(model);

    case "Ready":
      return viewReady(model);
  }
};

const viewProfileLoading = (_model: ProfileLoading): View.View<Msg> => {
  return () => <View.LoadingPage />;
};

const viewProfileMissing = (model: ProfileMissing): View.View<Msg> => {
  switch (model.page.type) {
    case "Logout":
      return pipe(
        Pages.Logout.view(model.page.child),
        View.map(groupTag("Logout"))
      );

    case "ProfileCreate":
      return pipe(
        Pages.ProfileCreate.view(model.page.child),
        View.map(groupTag("ProfileCreate"))
      );

    default:
      return exhaustive(model.page);
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

const viewReady =
  (model: Ready): View.View<Msg> =>
  (dispatch) =>
    <>{viewReadyPage(model)(dispatch)}</>;

const viewReadyPage = ({ page, profile, game }: Ready): View.View<Msg> => {
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
      return pipe(Game.view(game), View.map(groupTag("Game")));

    case "Chat":
      return pipe(Pages.Chat.view(page.child), View.map(groupTag("Chat")));

    case "ChatNew":
      return pipe(
        Pages.ChatNew.view(page.child),
        View.map(groupTag("ChatNew"))
      );

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
  }: {
    snackbar: Snackbar.Model;
    location: Navigation.Location;
  },
  outMsgs: OutMsg[]
): [SessionMissing, Cmd<Msg>, OutMsg[]] => {
  const child = Pages.Login.init;

  return [
    {
      type: "SessionMissing",
      snackbar,
      location,
      page: { type: "Login", child },
    },
    Navigation.push(Route.encode({ type: "Login" })),
    outMsgs,
  ];
};

const initProfileMissing = ({
  location,
  session,
  snackbar,
}: {
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
}): [ProfileMissing, Cmd<Msg>, OutMsg[]] => {
  const [page, pageCmd] = initProfileMissingPage({ location, session });
  return [
    {
      type: "ProfileMissing",
      session,
      snackbar,
      location,
      page: page,
    },
    pageCmd,
    [],
  ];
};

const initProfileMissingPage = ({
  location,
  session,
}: {
  session: Session.Session;
  location: Navigation.Location;
}): [ProfileMissing["page"], Cmd<Msg>] => {
  const route = pipe(
    location.pathname,
    Route.decode,
    option.fold<Route.Route, Route.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [ProfileMissing["page"], Cmd<Msg>] = [
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
  profile,
  snackbar,
  session,
}: {
  location: Navigation.Location;
  snackbar: Snackbar.Model;
  profile: Profile.Profile;
  session: Session.Session;
}): [Ready, Cmd<Msg>, OutMsg[]] => {
  const [page, pageCmd] = initReadyPage({ profile, location });
  return [
    {
      type: "Ready",
      location: location,
      snackbar: snackbar,
      session: session,
      profile: profile,
      game: Game.init,
      page: page,
    },
    pageCmd,
    [Snackbar.EnqueuedSnackbar(`Signed in as ${profile.username}.`)],
  ];
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
      return [{ type: "ChatNew", child: Pages.ChatNew.init }, cmd.none];

    default:
      return exhaustive(route);
  }
};

const initProfileLoading = ({
  session,
  location,
  snackbar,
}: {
  session: Session.Session;
  snackbar: Snackbar.Model;
  location: Navigation.Location;
}): [ProfileLoading, Cmd<Msg>, OutMsg[]] => {
  return [
    {
      type: "ProfileLoading",
      snackbar,
      location,
      session,
    },
    pipe(Profile.load(session), task.attempt(profileResultToMsg)),
    [],
  ];
};

const profileResultToMsg = either.fold<Error, Profile.Profile, Msg>(
  (_error) => ({
    group: "Profile",
    type: "RecievedProfile",
    profile: option.none,
  }),
  (profile) => ({
    group: "Profile",
    type: "RecievedProfile",
    profile: option.some(profile),
  })
);

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
