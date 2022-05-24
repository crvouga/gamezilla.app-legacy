import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react, sub, task } from "Framework";
import { Cmd } from "Framework/Cmd";
import { programWithDebugger } from "Framework/Debug/Navigation";
import * as Game from "Game";
import * as Pages from "Pages";
import * as Profile from "Profile";
import React from "react";
import { createRoot } from "react-dom/client";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import { exhaustive, groupTag } from "Utility";
import * as View from "View";

//
//
//
// Model
//
//
//

type Model =
  | SessionLoadingModel
  | SessionMissingModel
  | ProfileLoadingModel
  | ProfileMissingModel
  | ReadyModel;

//
//
//
// Location
//
//
//

export const locationToMsg = (location: navigation.Location): Msg => {
  return { group: "Location", type: "RecievedLocation", location: location };
};

//
//
//
// Init
//
//
//

export const init = (location: navigation.Location): [Model, Cmd<Msg>] => {
  return initSessionLoading({ location });
};

//
//
// Msg
//
//
//

export type Msg = MainMsg | SharedMsg | PageMsg;

type MainMsg =
  | {
      type: "RecievedLocation";
      location: navigation.Location;
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
    };

type SharedMsg = Snackbar.GroupedMsg;

type PageMsg =
  | (Pages.Account.Msg & { group: "Account" })
  | (Pages.Chess.Msg & { group: "Chess" })
  | (Pages.ConnectFour.Msg & { group: "ConnectFour" })
  | (Pages.Home.Msg & { group: "Home" })
  | (Pages.Login.Msg & { group: "Login" })
  | (Pages.Logout.Msg & { group: "Logout" })
  | (Pages.ProfileCreate.Msg & { group: "ProfileCreate" })
  | (Pages.ProfileDelete.Msg & { group: "ProfileDelete" })
  | (Pages.ProfileUpdate.Msg & { group: "ProfileUpdate" })
  | (Pages.ProfileUpdateAvatar.Msg & { group: "ProfileUpdateAvatar" })
  | (Pages.ProfileUpdateName.Msg & { group: "ProfileUpdateName" })
  | (Pages.ProfileUpdateUsername.Msg & { group: "ProfileUpdateUsername" })
  | (Pages.TicTacToe.Msg & { group: "TicTacToe" });

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  const [modelPrev, cmdPrev, outMsgs] = updateMain(msg, model);

  const msgs = [msg, ...outMsgs];

  const [modelNew, cmdNew] = msgs.reduce<[Model, Cmd<Msg>]>(
    ([modelPrev, cmdPrev], msg) => {
      const [modelNew, cmdNew] = updateShared(msg, modelPrev);
      return [modelNew, cmd.batch([cmdPrev, cmdNew])];
    },
    [modelPrev, cmdPrev]
  );

  return [modelNew, cmdNew];
};

const updateShared = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Snackbar":
      const [snackbarModel, snackbarCmd] = Snackbar.update(msg, model.snackbar);
      return [
        { ...model, snackbar: snackbarModel },
        pipe(snackbarCmd, cmd.map(groupTag("Snackbar"))),
      ];

    case "Location":
      return [{ ...model, location: msg.location }, cmd.none];

    default:
      return [model, cmd.none];
  }
};

const updateMain = (msg: Msg, model: Model): [Model, Cmd<Msg>, SharedMsg[]] => {
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

//
//
//
// View
//
//
//

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.ThemeProvider>
        {viewMain(model)(dispatch)}

        {pipe(
          Snackbar.view(model.snackbar),
          react.map(groupTag("Snackbar"))
        )(dispatch)}
      </View.ThemeProvider>
    );

const viewMain = (model: Model): react.Html<Msg> => {
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

//
//
//
//
//
//
// ProfileMissing
//
//
//
//
//
//

type ProfileMissingModel = {
  type: "ProfileMissing";
  location: navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
  page:
    | { type: "ProfileCreate"; child: Pages.ProfileCreate.Model }
    | { type: "Logout"; child: Pages.Logout.Model };
};

const initProfileMissing = ({
  location,
  session,
  snackbar,
}: {
  location: navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
}): [ProfileMissingModel, Cmd<Msg>, SharedMsg[]] => {
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
  location: navigation.Location;
}): [ProfileMissingModel["page"], Cmd<Msg>] => {
  const route = pipe(
    location.pathname,
    Route.decode,
    option.fold<Route.Route, Route.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [ProfileMissingModel["page"], Cmd<Msg>] = [
    { type: "ProfileCreate", child: Pages.ProfileCreate.init(session) },
    navigation.push(Route.encode({ type: "ProfileCreate" })),
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

const updateProfileMissing = (
  msg: Msg,
  model: ProfileMissingModel
): [Model, Cmd<Msg>, SharedMsg[]] => {
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
  model: ProfileMissingModel,
  msg: Msg,
  page: ProfileMissingModel["page"]
): [ProfileMissingModel["page"], Cmd<Msg>, SharedMsg[]] => {
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

//
//
//
//
//
//
// SessionMissing
//
//
//
//
//
//

type SessionMissingModel = {
  type: "SessionMissing";
  location: navigation.Location;
  snackbar: Snackbar.Model;
  page: { type: "Login"; child: Pages.Login.Model };
};

const initSessionMissing = (
  {
    location,
    snackbar,
  }: {
    snackbar: Snackbar.Model;
    location: navigation.Location;
  },
  outMsgs: SharedMsg[]
): [SessionMissingModel, Cmd<Msg>, SharedMsg[]] => {
  const child = Pages.Login.init;

  return [
    {
      type: "SessionMissing",
      snackbar,
      location,
      page: { type: "Login", child },
    },
    navigation.push(Route.encode({ type: "Login" })),
    outMsgs,
  ];
};

const updateSessionMissing = (
  msg: Msg,
  model: SessionMissingModel
): [Model, Cmd<Msg>, SharedMsg[]] => {
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
  page: SessionMissingModel["page"]
): [SessionMissingModel["page"], Cmd<Msg>] => {
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

//
//
//
//
//
//
// SessionLoading
//
//
//
//
//
//

type SessionLoadingModel = {
  type: "SessionLoading";
  location: navigation.Location;
  snackbar: Snackbar.Model;
};

const initSessionLoading = ({
  location,
}: {
  location: navigation.Location;
}): [SessionLoadingModel, Cmd<Msg>] => {
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

const updateSessionLoading = (
  msg: Msg,
  model: SessionLoadingModel
): [Model, Cmd<Msg>, SharedMsg[]] => {
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

//
//
//
//
//
//
// ProfileLoading
//
//
//
//
//
//

type ProfileLoadingModel = {
  type: "ProfileLoading";
  location: navigation.Location;
  snackbar: Snackbar.Model;
  session: Session.Session;
};

const initProfileLoading = ({
  session,
  location,
  snackbar,
}: {
  session: Session.Session;
  snackbar: Snackbar.Model;
  location: navigation.Location;
}): [ProfileLoadingModel, Cmd<Msg>, SharedMsg[]] => {
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

const updateProfileLoading = (
  msg: Msg,
  model: ProfileLoadingModel
): [Model, Cmd<Msg>, SharedMsg[]] => {
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

//
//
//
//
//
//
// Ready
//
//
//
//
//
//

type ReadyModel = {
  type: "Ready";
  location: navigation.Location;
  snackbar: Snackbar.Model;
  profile: Profile.Profile;
  session: Session.Session;
  game: Game.Model;
  page: ReadyPage;
};

//
// Init
//

const initReady = ({
  location,
  profile,
  snackbar,
  session,
}: {
  location: navigation.Location;
  snackbar: Snackbar.Model;
  profile: Profile.Profile;
  session: Session.Session;
}): [ReadyModel, Cmd<Msg>, SharedMsg[]] => {
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

//
// Update
//

const updateReady = (
  msg: Msg,
  model: ReadyModel
): [Model, Cmd<Msg>, SharedMsg[]] => {
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

//
//
//
// Ready Page
//
//
//

type ReadyPage =
  | { type: "Home"; child: Pages.Home.Model }
  | { type: "Account"; child: Pages.Account.Model }
  | { type: "Chess"; child: Pages.Chess.Model }
  | { type: "ConnectFour"; child: Pages.ConnectFour.Model }
  | { type: "Logout"; child: Pages.Logout.Model }
  | { type: "ProfileDelete"; child: Pages.ProfileDelete.Model }
  | { type: "ProfileUpdate"; child: Pages.ProfileUpdate.Model }
  | { type: "ProfileUpdateAvatar"; child: Pages.ProfileUpdateAvatar.Model }
  | { type: "ProfileUpdateName"; child: Pages.ProfileUpdateName.Model }
  | {
      type: "ProfileUpdateUsername";
      child: Pages.ProfileUpdateUsername.Model;
    }
  | { type: "TicTacToe"; child: Pages.TicTacToe.Model };

const initReadyPage = ({
  profile,
  location,
}: {
  profile: Profile.Profile;
  location: navigation.Location;
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
    navigation.push(Route.encode({ type: "Home" })),
  ];

  switch (route.type) {
    case "Account":
      return [{ type: "Account", child: Pages.Account.init }, cmd.none];

    case "Chess":
      return [{ type: "Chess", child: Pages.Chess.init }, cmd.none];

    case "ConnectFour":
      return [{ type: "ConnectFour", child: Pages.ConnectFour.init }, cmd.none];

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

    case "TicTacToe":
      return [{ type: "TicTacToe", child: Pages.TicTacToe.init }, cmd.none];

    default:
      return exhaustive(route);
  }
};

const updateReadyPage = (
  { profile }: { profile: Profile.Profile; location: navigation.Location },
  msg: Msg,
  page: ReadyModel["page"]
): [ReadyModel["page"], Cmd<Msg>, SharedMsg[]] => {
  if (page.type === "Account" && msg.group === "Account") {
    const [child, childCmd] = Pages.Account.update(profile, msg, page.child);
    return [
      { type: "Account", child },
      pipe(childCmd, cmd.map(groupTag("Account"))),
      [],
    ];
  }

  if (page.type === "Chess" && msg.group === "Chess") {
    const [child, childCmd] = Pages.Chess.update(msg, page.child);
    return [{ type: "Chess", child }, childCmd, []];
  }

  if (page.type === "ConnectFour" && msg.group === "ConnectFour") {
    const [child, childCmd] = Pages.ConnectFour.update(msg, page.child);
    return [{ type: "ConnectFour", child }, childCmd, []];
  }

  if (page.type === "Home" && msg.group === "Home") {
    const [child, childCmd] = Pages.Home.update(msg, page.child);
    return [
      { type: "Home", child },
      pipe(childCmd, cmd.map(groupTag("Home"))),
      [],
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

  if (page.type === "TicTacToe" && msg.group === "TicTacToe") {
    const [child, childCmd] = Pages.TicTacToe.update(msg, page.child);
    return [
      { type: "TicTacToe", child },
      pipe(childCmd, cmd.map(groupTag("TicTacToe"))),
      [],
    ];
  }

  return [page, cmd.none, []];
};

//
// View
//

const viewReady = ({ page, profile }: ReadyModel): react.Html<Msg> => {
  switch (page.type) {
    case "Account":
      return pipe(
        Pages.Account.view(profile, page.child),
        react.map(groupTag("Account"))
      );

    case "Chess":
      return Pages.Chess.view(page.child);

    case "Home":
      return pipe(
        Pages.Home.view(profile, page.child),
        react.map(groupTag("Home"))
      );

    case "ConnectFour":
      return Pages.ConnectFour.view(page.child);

    case "Logout":
      return pipe(Pages.Logout.view(page.child), react.map(groupTag("Logout")));

    case "ProfileDelete":
      return pipe(
        Pages.ProfileDelete.view(page.child),
        react.map(groupTag("ProfileDelete"))
      );

    case "ProfileUpdate":
      return pipe(
        Pages.ProfileUpdate.view(profile, page.child),
        react.map(groupTag("ProfileUpdate"))
      );

    case "ProfileUpdateAvatar":
      return pipe(
        Pages.ProfileUpdateAvatar.view(page.child),
        react.map(groupTag("ProfileUpdateAvatar"))
      );

    case "ProfileUpdateName":
      return pipe(
        Pages.ProfileUpdateName.view(page.child),
        react.map(groupTag("ProfileUpdateName"))
      );

    case "ProfileUpdateUsername":
      return pipe(
        Pages.ProfileUpdateUsername.view(page.child),
        react.map(groupTag("ProfileUpdateUsername"))
      );

    case "TicTacToe":
      return pipe(
        Pages.TicTacToe.view(page.child),
        react.map(groupTag("TicTacToe"))
      );

    default:
      return exhaustive(page);
  }
};

//
//
// Subscriptions
//
//

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "ProfileLoading":
      return sessionSubcription();

    case "ProfileMissing":
      return sub.batch([
        sessionSubcription(),
        profileSubscription(model.session),
      ]);

    case "Ready":
      return sub.batch([
        sessionSubcription(),
        profileSubscription(model.profile),
      ]);

    case "SessionLoading":
      return sessionSubcription();

    case "SessionMissing":
      return sessionSubcription();
  }
};

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
// View
//
//

const viewProfileLoading = (model: ProfileLoadingModel): react.Html<Msg> => {
  return () => <View.LoadingPage />;
};

const viewProfileMissing = (model: ProfileMissingModel): react.Html<Msg> => {
  switch (model.page.type) {
    case "Logout":
      return pipe(
        Pages.Logout.view(model.page.child),
        react.map(groupTag("Logout"))
      );

    case "ProfileCreate":
      return pipe(
        Pages.ProfileCreate.view(model.page.child),
        react.map(groupTag("ProfileCreate"))
      );

    default:
      return exhaustive(model.page);
  }
};

const viewSessionLoading = (model: SessionLoadingModel): react.Html<Msg> => {
  return () => <View.LoadingPage />;
};

const viewSessionMissing = (model: SessionMissingModel): react.Html<Msg> => {
  switch (model.page.type) {
    case "Login":
      return pipe(
        Pages.Login.view(model.page.child),
        react.map(groupTag("Login"))
      );

    default:
      return exhaustive(model.page.type);
  }
};

//
//
//
// Utils
//
//
//

const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd<Msg>],
    msg: Msg
  ) =>
  ([model, cmdPrev]: [Model, Cmd<Msg>]): [Model, Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };

//
//
//
// Main
//
//
//

const program = programWithDebugger(
  locationToMsg,
  init,
  update,
  view,
  subscriptions
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root dom node");
}

const root = createRoot(rootElement);

react.run(program, (dom) => {
  root.render(dom);
});
