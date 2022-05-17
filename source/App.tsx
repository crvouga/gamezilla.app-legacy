import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import UrlPattern from "url-pattern";
import { cmd, navigation, react, sub } from "./Framework";
import { attempt, perform } from "./Framework/Task";
import * as Pages from "./Pages";
import * as Profile from "./Profile";
import * as Routes from "./Routes";
import * as Session from "./Session";
import { exhaustive } from "./Utility";
import * as View from "./View";

// ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝

type Model =
  | SessionLoadingModel
  | SessionMissingModel
  | ProfileLoadingModel
  | ProfileMissingModel
  | ReadyModel;

type SessionLoadingModel = {
  type: "SessionLoading";
  location: Location;
};

type SessionMissingModel = {
  type: "SessionMissing";
  location: Location;
  page: { type: "Login"; child: Pages.Login.Model };
};

type ProfileLoadingModel = {
  type: "ProfileLoading";
  location: Location;
  userId: string;
  defaultName: string;
};

type ProfileMissingModel = {
  type: "ProfileMissing";
  location: Location;
  userId: string;
  defaultName: string;
  page:
    | { type: "ProfileCreate"; child: Pages.ProfileCreate.Model }
    | { type: "Logout"; child: Pages.Logout.Model };
};

type ReadyModel = {
  type: "Ready";
  location: Location;
  profile: Profile;
  page:
    | { type: "Home"; child: Pages.Home.Model }
    | { type: "Account"; child: Pages.Account.Model }
    | { type: "Chess"; child: Pages.Chess.Model }
    | { type: "ConnectFour"; child: Pages.ConnectFour.Model }
    | { type: "Logout"; child: Pages.Logout.Model }
    | { type: "ProfileCreate"; child: Pages.ProfileCreate.Model }
    | { type: "ProfileDelete"; child: Pages.ProfileDelete.Model }
    | { type: "ProfileUpdate"; child: Pages.ProfileUpdate.Model }
    | { type: "ProfileUpdateAvatar"; child: Pages.ProfileUpdateAvatar.Model }
    | { type: "ProfileUpdateName"; child: Pages.ProfileUpdateName.Model }
    | {
        type: "ProfileUpdateUsername";
        child: Pages.ProfileUpdateUsername.Model;
      }
    | { type: "TicTacToe"; child: Pages.TicTacToe.Model };
};

type Location = { pathname: string };

type Profile = {
  name: string;
  avatarUrl: string;
  username: string;
  userId: string;
};

// ██╗███╗   ██╗██╗████████╗
// ██║████╗  ██║██║╚══██╔══╝
// ██║██╔██╗ ██║██║   ██║
// ██║██║╚██╗██║██║   ██║
// ██║██║ ╚████║██║   ██║
// ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝

export const init = (location: navigation.Location): [Model, cmd.Cmd<Msg>] => [
  { type: "SessionLoading", location: location },
  pipe(Session.load(), perform(maybeSessionToMsg)),
];

const initSessionMissing = (
  location: Location
): [SessionMissingModel, cmd.Cmd<Msg>] => {
  const child = Pages.Login.init();

  return [
    { type: "SessionMissing", location, page: { type: "Login", child } },
    Routes.replace({ type: "Login" }),
  ];
};

const maybeSessionToMsg = option.fold<Session.Session, Msg>(
  () => ({ group: "Main", type: "SessionNotFound" }),
  (session) => ({ group: "Main", type: "SessionFound", ...session })
);

const initProfileLoading = ({
  session,
  location,
}: {
  session: Session.Session;
  location: Location;
}): [ProfileLoadingModel, cmd.Cmd<Msg>] => {
  return [
    {
      type: "ProfileLoading",
      location,
      defaultName: session.defaultName,
      userId: session.userId,
    },
    pipe(Profile.load(session), attempt(profileResultToMsg)),
  ];
};

const initProfileMissing = (deps: {
  userId: string;
  defaultName: string;
}): [ProfileMissingModel, cmd.Cmd<Msg>] => {
  return [
    {
      ...deps,
      type: "ProfileMissing",
      location: location,
      page: {
        type: "ProfileCreate",
        child: Pages.ProfileCreate.init(deps),
      },
    },
    Routes.replace({ type: "ProfileCreate" }),
  ];
};

const initReady = ({
  location,
  profile,
}: {
  location: Location;
  profile: Profile;
}): [ReadyModel, cmd.Cmd<Msg>] => {
  const [page, pageCmd] = initPageReady(profile, location);
  return [
    {
      type: "Ready",
      location: location,
      profile: profile,
      page: page,
    },
    pageCmd,
  ];
};

const initPageReady = (
  profile: Profile,
  location: { pathname: string }
): [ReadyModel["page"], cmd.Cmd<Msg>] => {
  const route = pipe(
    location,
    Routes.decode,
    option.fold<Routes.Route, Routes.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [ReadyModel["page"], cmd.Cmd<Msg>] = [
    { type: "Home", child: Pages.Home.init },
    Routes.push({ type: "Home" }),
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
        { type: "ProfileUpdate", child: Pages.ProfileUpdate.init(profile) },
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

// ███╗   ███╗███████╗ ██████╗
// ████╗ ████║██╔════╝██╔════╝
// ██╔████╔██║███████╗██║  ███╗
// ██║╚██╔╝██║╚════██║██║   ██║
// ██║ ╚═╝ ██║███████║╚██████╔╝
// ╚═╝     ╚═╝╚══════╝ ╚═════╝

export type Msg =
  | { group: "Main"; type: "LocationChanged"; location: Location }
  | { group: "Main"; type: "SessionFound"; userId: string; defaultName: string }
  | { group: "Main"; type: "SessionNotFound" }
  | { group: "Main"; type: "ProfileFound"; profile: Profile }
  | { group: "Main"; type: "ProfileNotFound" }
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

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  return pipe(
    [model, cmd.none],
    andThen(updateMain, msg),
    andThen(updatePage, msg)
  );
};

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗    ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝    ████╗ ████║██╔══██╗██║████╗  ██║
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗      ██╔████╔██║███████║██║██╔██╗ ██║
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝      ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗    ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

const updateMain = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
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
  model: ProfileMissingModel
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "ProfileFound":
      return initReady({ location: model.location, profile: msg.profile });

    default:
      return [model, cmd.none];
  }
};

const updateSessionMissing = (
  msg: Msg,
  model: SessionMissingModel
): [ProfileLoadingModel | SessionMissingModel, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "SessionFound":
      return initProfileLoading({ session: msg, location: model.location });

    default:
      return [model, cmd.none];
  }
};

const updateSessionLoading = (
  msg: Msg,
  model: SessionLoadingModel
): [
  ProfileLoadingModel | SessionLoadingModel | SessionMissingModel,
  cmd.Cmd<Msg>
] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "SessionFound":
      return initProfileLoading({ session: msg, location: model.location });

    case "SessionNotFound":
      return initSessionMissing(model.location);

    default:
      return [model, cmd.none];
  }
};

const profileResultToMsg = either.fold<Error, Profile.Profile, Msg>(
  (_error) => ({ group: "Main", type: "ProfileNotFound" }),
  (profile) => ({ group: "Main", type: "ProfileFound", profile })
);

const updateProfileLoading = (
  msg: Msg,
  model: ProfileLoadingModel
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "ProfileFound":
      return initReady({ ...model, ...msg });

    case "ProfileNotFound":
      return initProfileMissing(model);

    default:
      return [model, cmd.none];
  }
};

const updateReady = (msg: Msg, model: ReadyModel): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      const [page, pageCmd] = initPageReady(model.profile, msg.location);
      return [{ ...model, location: msg.location, page }, pageCmd];

    case "ProfileFound":
      return [{ ...model, profile: msg.profile, page }, pageCmd];

    case "ProfileNotFound":
      return initProfileMissing({
        userId: model.profile.userId,
        defaultName: model.profile.name,
      });

    case "SessionNotFound":
      return initSessionMissing(model.location);

    default:
      return [model, cmd.none];
  }
};

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗    ██████╗  █████╗  ██████╗ ███████╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝    ██╔══██╗██╔══██╗██╔════╝ ██╔════╝
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗      ██████╔╝███████║██║  ███╗█████╗
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝      ██╔═══╝ ██╔══██║██║   ██║██╔══╝
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗    ██║     ██║  ██║╚██████╔╝███████╗
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝

const updatePage = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "ProfileLoading":
      return [model, cmd.none];

    case "ProfileMissing": {
      const [modelPage, cmdPage] = updatePageProfileMissing(
        model,
        msg,
        model.page
      );
      return [{ ...model, page: modelPage }, cmdPage];
    }

    case "Ready": {
      const [modelPage, cmdPage] = updatePageReady(model, msg, model.page);
      return [{ ...model, page: modelPage }, cmdPage];
    }

    case "SessionLoading":
      return [model, cmd.none];

    case "SessionMissing": {
      const [modelPage, cmdPage] = updatePageSessionMissing(msg, model.page);
      return [{ ...model, page: modelPage }, cmdPage];
    }
  }
};

const updatePageSessionMissing = (
  msg: Msg,
  page: SessionMissingModel["page"]
): [SessionMissingModel["page"], cmd.Cmd<Msg>] => {
  switch (page.type) {
    case "Login":
      if (msg.group === "Login") {
        const [child, childCmd] = Pages.Login.update(msg, page.child);
        return [{ type: "Login", child }, childCmd];
      }

      return [page, cmd.none];
  }
};

const updatePageProfileMissing = (
  model: ProfileMissingModel,
  msg: Msg,
  page: ProfileMissingModel["page"]
): [ProfileMissingModel["page"], cmd.Cmd<Msg>] => {
  switch (page.type) {
    case "Logout":
      if (msg.group === "Logout") {
        const [child, childCmd] = Pages.Logout.update(msg, page.child);
        return [{ type: "Logout", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileCreate":
      if (msg.group === "ProfileCreate") {
        const [child, childCmd] = Pages.ProfileCreate.update(
          model,
          msg,
          page.child
        );
        return [{ type: "ProfileCreate", child }, childCmd];
      }
      return [page, cmd.none];
  }
};

const updatePageReady = (
  { profile }: { profile: Profile; location: Location },
  msg: Msg,
  page: ReadyModel["page"]
): [ReadyModel["page"], cmd.Cmd<Msg>] => {
  switch (page.type) {
    case "Account":
      if (msg.group === "Account") {
        const [child, childCmd] = Pages.Account.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "Account", child }, childCmd];
      }
      return [page, cmd.none];

    case "Chess":
      if (msg.group === "Chess") {
        const [child, childCmd] = Pages.Chess.update(msg, page.child);
        return [{ type: "Chess", child }, childCmd];
      }
      return [page, cmd.none];

    case "ConnectFour":
      if (msg.group === "ConnectFour") {
        const [child, childCmd] = Pages.ConnectFour.update(msg, page.child);
        return [{ type: "ConnectFour", child }, childCmd];
      }
      return [page, cmd.none];

    case "Home":
      if (msg.group === "Home") {
        const [child, childCmd] = Pages.Home.update(msg, page.child);
        return [{ type: "Home", child }, childCmd];
      }

      return [page, cmd.none];

    case "Logout":
      if (msg.group === "Logout") {
        const [child, childCmd] = Pages.Logout.update(msg, page.child);
        return [{ type: "Logout", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileCreate":
      if (msg.group === "ProfileCreate") {
        const [child, childCmd] = Pages.ProfileCreate.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileCreate", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileDelete":
      if (msg.group === "ProfileDelete") {
        const [child, childCmd] = Pages.ProfileDelete.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileDelete", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdate":
      if (msg.group === "ProfileUpdate") {
        const [child, childCmd] = Pages.ProfileUpdate.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdate", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateAvatar":
      if (
        msg.group === "ProfileUpdateAvatar" ||
        msg.type === "LocationChanged"
      ) {
        const [child, childCmd] = Pages.ProfileUpdateAvatar.update(
          { userId: profile.userId },
          msg,
          page.child
        );
        return [
          { type: "ProfileUpdateAvatar", child },
          pipe(childCmd, cmd.map(groupMsg("ProfileUpdateAvatar"))),
        ];
      }
      return [page, cmd.none];

    case "ProfileUpdateName":
      if (msg.group === "ProfileUpdateName") {
        const [child, childCmd] = Pages.ProfileUpdateName.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateName", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateUsername":
      if (msg.group === "ProfileUpdateUsername") {
        const [child, childCmd] = Pages.ProfileUpdateUsername.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateUsername", child }, childCmd];
      }
      return [page, cmd.none];

    case "TicTacToe":
      if (msg.group === "TicTacToe") {
        const [child, childCmd] = Pages.TicTacToe.update(msg, page.child);
        return [
          { type: "TicTacToe", child },
          pipe(childCmd, cmd.map(groupMsg("TicTacToe"))),
        ];
      }
      return [page, cmd.none];

    default:
      return exhaustive(page);
  }
};

// ███████╗██╗   ██╗██████╗ ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗
// ██╔════╝██║   ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
// ███████╗██║   ██║██████╔╝███████╗██║     ██████╔╝██║██████╔╝   ██║   ██║██║   ██║██╔██╗ ██║███████╗
// ╚════██║██║   ██║██╔══██╗╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   ██║██║   ██║██║╚██╗██║╚════██║
// ███████║╚██████╔╝██████╔╝███████║╚██████╗██║  ██║██║██║        ██║   ██║╚██████╔╝██║ ╚████║███████║
// ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.type) {
    case "ProfileLoading":
      return sessionSub();

    case "ProfileMissing":
      return sub.batch([sessionSub(), profileSub(model)]);

    case "Ready":
      return sub.batch([sessionSub(), profileSub(model.profile)]);

    case "SessionLoading":
      return sessionSub();

    case "SessionMissing":
      return sessionSub();
  }
};

const profileSub = ({ userId }: { userId: string }) => {
  return pipe(Profile.subscriptions({ userId }), sub.map(maybeProfileToMsg));
};

const sessionSub = () => {
  return pipe(Session.subscriptions(), sub.map(maybeSessionToMsg));
};

const maybeProfileToMsg = option.fold<Profile.Profile, Msg>(
  () => ({ type: "ProfileNotFound", group: "Main" }),
  (profile) => ({ type: "ProfileFound", profile, group: "Main" })
);

// ██╗   ██╗██╗███████╗██╗    ██╗
// ██║   ██║██║██╔════╝██║    ██║
// ██║   ██║██║█████╗  ██║ █╗ ██║
// ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    <View.ThemeProvider>{viewMain(model)(dispatch)}</View.ThemeProvider>;

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

const viewProfileLoading = (model: ProfileLoadingModel): react.Html<Msg> => {
  return () => <View.LoadingPage />;
};

const viewProfileMissing = (model: ProfileMissingModel): react.Html<Msg> => {
  switch (model.page.type) {
    case "Logout":
      return Pages.Logout.view(model.page.child);

    case "ProfileCreate":
      return Pages.ProfileCreate.view(model.page.child);

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
      return Pages.Login.view(model.page.child);

    default:
      return exhaustive(model.page.type);
  }
};

const viewReady = ({ page, profile }: ReadyModel): react.Html<Msg> => {
  switch (page.type) {
    case "Account":
      return Pages.Account.view(profile, page.child);

    case "Chess":
      return Pages.Chess.view(page.child);

    case "Home":
      return Pages.Home.view(profile, page.child);

    case "ConnectFour":
      return Pages.ConnectFour.view(page.child);

    case "Logout":
      return Pages.Logout.view(page.child);

    case "ProfileCreate":
      return Pages.ProfileCreate.view(page.child);

    case "ProfileDelete":
      return Pages.ProfileDelete.view(page.child);

    case "ProfileUpdate":
      return Pages.ProfileUpdate.view(profile, page.child);

    case "ProfileUpdateAvatar":
      return pipe(
        Pages.ProfileUpdateAvatar.view(profile, page.child),
        react.map(groupMsg("ProfileUpdateAvatar"))
      );

    case "ProfileUpdateName":
      return Pages.ProfileUpdateName.view(page.child);

    case "ProfileUpdateUsername":
      return Pages.ProfileUpdateUsername.view(page.child);

    case "TicTacToe":
      return pipe(
        Pages.TicTacToe.view(page.child),
        react.map(groupMsg("TicTacToe"))
      );

    default:
      return exhaustive(page);
  }
};

// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝

const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, cmd.Cmd<Msg>],
    msg: Msg
  ) =>
  ([model, cmdPrev]: [Model, cmd.Cmd<Msg>]): [Model, cmd.Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };

const groupMsg =
  <Msg, Group extends string>(group: Group) =>
  (msg: Msg): Msg & { group: Group } => {
    return { ...msg, group: group } as const;
  };
