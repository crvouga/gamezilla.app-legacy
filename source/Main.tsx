import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { createRoot } from "react-dom/client";
import { cmd, react, sub, navigation } from "./Framework";
import { programWithDebugger } from "./Framework/Debug/Navigation";
import { attempt, perform } from "./Framework/Task";
import * as Session from "./Session";
import * as Profile from "./Profile";
import * as View from "./View";
import * as Page from "./Page";
import * as Routes from "./Routes";
import { exhaustive } from "./Utility";

//
//
//
// Model
//
//
//

export type Model =
  | SessionLoading
  | SessionMissing
  | ProfileLoading
  | ProfileMissing
  | Ready;

type SessionLoading = {
  type: "SessionLoading";
  location: Location;
};

type SessionMissing = {
  type: "SessionMissing";
  location: Location;
  page: { type: "Login"; child: Page.Login.Model };
};

type ProfileLoading = {
  type: "ProfileLoading";
  location: Location;
  userId: string;
  defaultName: string;
};

type ProfileMissing = {
  type: "ProfileMissing";
  location: Location;
  userId: string;
  defaultName: string;
  page:
    | { type: "ProfileCreate"; child: Page.ProfileCreate.Model }
    | { type: "Logout"; child: Page.Logout.Model };
};

type Ready = {
  type: "Ready";
  location: Location;
  profile: {
    userId: string;
    name: string;
    avatarUrl: string;
    username: string;
  };
  page:
    | { type: "Home"; child: Page.Home.Model }
    | { type: "Account"; child: Page.Account.Model }
    | { type: "Chess"; child: Page.Chess.Model }
    | { type: "ConnectFour"; child: Page.ConnectFour.Model }
    | { type: "Logout"; child: Page.Logout.Model }
    | { type: "ProfileCreate"; child: Page.ProfileCreate.Model }
    | { type: "ProfileDelete"; child: Page.ProfileDelete.Model }
    | { type: "ProfileUpdate"; child: Page.ProfileUpdate.Model }
    | { type: "ProfileUpdateAvatar"; child: Page.ProfileUpdateAvatar.Model }
    | {
        type: "ProfileUpdateAvatarStyle";
        child: Page.ProfileUpdateAvatarStyle.Model;
      }
    | { type: "ProfileUpdateName"; child: Page.ProfileUpdateName.Model }
    | { type: "ProfileUpdateUsername"; child: Page.ProfileUpdateUsername.Model }
    | { type: "TicTacToe"; child: Page.TicTacToe.Model };
};

type Location = { pathname: string };

export const init = (location: navigation.Location): [Model, cmd.Cmd<Msg>] => [
  { type: "SessionLoading", location: location },
  pipe(Session.load(), perform(maybeSessionToMsg)),
];

const initSessionMissing = (
  location: Location
): [SessionMissing, cmd.Cmd<Msg>] => {
  const child = Page.Login.init();

  return [
    { type: "SessionMissing", location, page: { type: "Login", child } },
    Routes.replace({ type: "Login" }),
  ];
};

const maybeSessionToMsg = option.fold<Session.Session, Msg>(
  () => ({ group: "Main", type: "SessionNotFound" }),
  (session) => ({ group: "Main", type: "SessionFound", ...session })
);

//
//
//
// Update
//
//
//

type Profile = {
  name: string;
  avatarUrl: string;
  username: string;
  userId: string;
};

export type Msg =
  | { group: "Main"; type: "LocationChanged"; location: Location }
  | { group: "Main"; type: "SessionFound"; userId: string; defaultName: string }
  | { group: "Main"; type: "SessionNotFound" }
  | { group: "Main"; type: "ProfileFound"; profile: Profile }
  | { group: "Main"; type: "ProfileNotFound" }
  | Page.Account.Msg
  | Page.Chess.Msg
  | Page.ConnectFour.Msg
  | Page.Home.Msg
  | Page.Login.Msg
  | Page.Logout.Msg
  | Page.ProfileCreate.Msg
  | Page.ProfileDelete.Msg
  | Page.ProfileUpdate.Msg
  | Page.ProfileUpdateAvatar.Msg
  | Page.ProfileUpdateAvatarStyle.Msg
  | Page.ProfileUpdateName.Msg
  | Page.ProfileUpdateUsername.Msg
  | Page.TicTacToe.Msg;

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "SessionLoading":
      return updateSessionLoading(msg, model);

    case "ProfileLoading":
      return updateProfileLoading(msg, model);

    case "ProfileMissing":
      return [model, cmd.none];

    case "Ready":
      return updateReady(msg, model);

    case "SessionMissing":
      return updateSessionMissing(msg, model);
  }
};

const updateSessionMissing = (
  msg: Msg,
  model: SessionMissing
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Main":
      switch (msg.type) {
        case "LocationChanged":
          return [{ ...model, location: msg.location }, cmd.none];

        default:
          return [model, cmd.none];
      }

    default:
      switch (model.page.type) {
        case "Login":
          if (msg.group === "Login") {
            const [child, childCmd] = Page.Login.update(msg, model.page.child);
            return [{ ...model, page: { type: "Login", child } }, childCmd];
          }

          return [model, cmd.none];
      }
  }
};

const updateSessionLoading = (
  msg: Msg,
  model: SessionLoading
): [ProfileLoading | SessionLoading | SessionMissing, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "SessionFound":
      return [
        { ...msg, location: model.location, type: "ProfileLoading" },
        pipe(Profile.load(msg), attempt(profileResultToMsg)),
      ];

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
  model: ProfileLoading
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LocationChanged":
      return [{ ...model, location: msg.location }, cmd.none];

    case "ProfileFound":
      const [page, pageCmd] = initReadyPage(msg.profile, model.location);
      return [
        {
          type: "Ready",
          location: model.location,
          profile: msg.profile,
          page: page,
        },
        pageCmd,
      ];

    case "ProfileNotFound":
      return [model, cmd.none];

    default:
      return [model, cmd.none];
  }
};

//
//
//
// Update Ready
//
//
//

const updateReady = (msg: Msg, model: Ready): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Main":
      switch (msg.type) {
        case "LocationChanged":
          const [page, pageCmd] = initReadyPage(model.profile, msg.location);
          return [{ ...model, location: msg.location, page }, pageCmd];

        case "ProfileFound":
          return [{ ...model, profile: msg.profile, page }, pageCmd];

        case "SessionNotFound":
          return initSessionMissing(model.location);

        default:
          return [model, cmd.none];
      }
    default: {
      const [page, pageCmd] = updateReadyPage(model.profile, msg, model.page);
      return [{ ...model, page }, pageCmd];
    }
  }
};

const initReadyPage = (
  profile: Profile,
  location: { pathname: string }
): [Ready["page"], cmd.Cmd<Msg>] => {
  const route = pipe(
    location,
    Routes.decode,
    option.fold<Routes.Route, Routes.Route | { type: "NotFound" }>(
      () => ({ type: "NotFound" }),
      (route) => route
    )
  );

  const notFound: [Ready["page"], cmd.Cmd<Msg>] = [
    { type: "Home", child: Page.Home.init },
    Routes.push({ type: "Home" }),
  ];

  switch (route.type) {
    case "Account":
      return [{ type: "Account", child: Page.Account.init }, cmd.none];

    case "Chess":
      return [{ type: "Chess", child: Page.Chess.init }, cmd.none];

    case "ConnectFour":
      return [{ type: "ConnectFour", child: Page.ConnectFour.init }, cmd.none];

    case "Home":
      return [{ type: "Home", child: Page.Home.init }, cmd.none];

    case "Login":
      return notFound;

    case "Logout":
      return [{ type: "Logout", child: Page.Logout.init }, cmd.none];

    case "NotFound":
      return notFound;

    case "ProfileCreate":
      return notFound;

    case "ProfileDelete":
      return [
        { type: "ProfileDelete", child: Page.ProfileDelete.init },
        cmd.none,
      ];

    case "ProfileUpdate":
      return [
        { type: "ProfileUpdate", child: Page.ProfileUpdate.init(profile) },
        cmd.none,
      ];

    case "ProfileUpdateAvatar":
      return [
        {
          type: "ProfileUpdateAvatar",
          child: Page.ProfileUpdateAvatar.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateAvatarStyle":
      return [
        {
          type: "ProfileUpdateAvatarStyle",
          child: Page.ProfileUpdateAvatarStyle.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateName":
      return [
        {
          type: "ProfileUpdateName",
          child: Page.ProfileUpdateName.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateUsername":
      return [
        {
          type: "ProfileUpdateUsername",
          child: Page.ProfileUpdateUsername.init(profile),
        },
        cmd.none,
      ];

    case "TicTacToe":
      return [{ type: "TicTacToe", child: Page.TicTacToe.init }, cmd.none];
  }
};

const updateReadyPage = (
  profile: Profile,
  msg: Msg,
  page: Ready["page"]
): [Ready["page"], cmd.Cmd<Msg>] => {
  switch (page.type) {
    case "Account":
      if (msg.group === "Account") {
        const [child, childCmd] = Page.Account.update(profile, msg, page.child);
        return [{ type: "Account", child }, childCmd];
      }
      return [page, cmd.none];

    case "Chess":
      if (msg.group === "Chess") {
        const [child, childCmd] = Page.Chess.update(msg, page.child);
        return [{ type: "Chess", child }, childCmd];
      }
      return [page, cmd.none];

    case "ConnectFour":
      if (msg.group === "ConnectFour") {
        const [child, childCmd] = Page.ConnectFour.update(msg, page.child);
        return [{ type: "ConnectFour", child }, childCmd];
      }
      return [page, cmd.none];

    case "Home":
      if (msg.group === "Home") {
        const [child, childCmd] = Page.Home.update(msg, page.child);
        return [{ type: "Home", child }, childCmd];
      }

      return [page, cmd.none];

    case "Logout":
      if (msg.group === "Logout") {
        const [child, childCmd] = Page.Logout.update(msg, page.child);
        return [{ type: "Logout", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileCreate":
      if (msg.group === "ProfileCreate") {
        const [child, childCmd] = Page.ProfileCreate.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileCreate", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileDelete":
      if (msg.group === "ProfileDelete") {
        const [child, childCmd] = Page.ProfileDelete.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileDelete", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdate":
      if (msg.group === "ProfileUpdate") {
        const [child, childCmd] = Page.ProfileUpdate.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdate", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateAvatar":
      if (msg.group === "ProfileUpdateAvatar") {
        const [child, childCmd] = Page.ProfileUpdateAvatar.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateAvatar", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateAvatarStyle":
      if (msg.group === "ProfileUpdateAvatarStyle") {
        const [child, childCmd] = Page.ProfileUpdateAvatarStyle.update(
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateAvatarStyle", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateName":
      if (msg.group === "ProfileUpdateName") {
        const [child, childCmd] = Page.ProfileUpdateName.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateName", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileUpdateUsername":
      if (msg.group === "ProfileUpdateUsername") {
        const [child, childCmd] = Page.ProfileUpdateUsername.update(
          profile,
          msg,
          page.child
        );
        return [{ type: "ProfileUpdateUsername", child }, childCmd];
      }
      return [page, cmd.none];

    case "TicTacToe":
      if (msg.group === "TicTacToe") {
        const [child, childCmd] = Page.TicTacToe.update(msg, page.child);
        return [{ type: "TicTacToe", child }, childCmd];
      }
      return [page, cmd.none];

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
    case "ProfileLoading":
      return sub.batch([
        pipe(Session.subscriptions(), sub.map(maybeSessionToMsg)),
      ]);

    case "ProfileMissing":
      return sub.batch([
        pipe(Session.subscriptions(), sub.map(maybeSessionToMsg)),
        pipe(Profile.subscriptions(model), sub.map(maybeProfileToMsg)),
      ]);

    case "Ready":
      return sub.batch([
        pipe(Session.subscriptions(), sub.map(maybeSessionToMsg)),
        pipe(Profile.subscriptions(model.profile), sub.map(maybeProfileToMsg)),
      ]);

    case "SessionLoading":
      return sub.batch([
        pipe(Session.subscriptions(), sub.map(maybeSessionToMsg)),
      ]);

    case "SessionMissing":
      return sub.batch([
        pipe(Session.subscriptions(), sub.map(maybeSessionToMsg)),
      ]);
  }
};

const maybeProfileToMsg = option.fold<Profile.Profile, Msg>(
  () => ({ type: "ProfileNotFound", group: "Main" }),
  (profile) => ({ type: "ProfileFound", profile, group: "Main" })
);

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
    <View.ThemeProvider>{viewMain(model)(dispatch)}</View.ThemeProvider>;

export const viewMain = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "ProfileLoading":
      return () => <View.LoadingPage />;

    case "ProfileMissing":
      return () => <View.LoadingPage />;

    case "SessionLoading":
      return () => <View.LoadingPage />;

    case "SessionMissing":
      switch (model.page.type) {
        case "Login":
          return Page.Login.view(model.page.child);

        default:
          return exhaustive(model.page.type);
      }

    case "Ready":
      return viewReadyPage(model.profile, model.page);
  }
};

const viewReadyPage = (
  profile: Profile,
  page: Ready["page"]
): react.Html<Msg> => {
  switch (page.type) {
    case "Account":
      return Page.Account.view(profile, page.child);

    case "Chess":
      return Page.Chess.view(page.child);

    case "Home":
      return Page.Home.view(profile, page.child);

    case "ConnectFour":
      return Page.ConnectFour.view(page.child);

    case "Logout":
      return Page.Logout.view(page.child);

    case "ProfileCreate":
      return Page.ProfileCreate.view(page.child);

    case "ProfileDelete":
      return Page.ProfileDelete.view(page.child);

    case "ProfileUpdate":
      return Page.ProfileUpdate.view(profile, page.child);

    case "ProfileUpdateAvatar":
      return Page.ProfileUpdateAvatar.view(profile, page.child);

    case "ProfileUpdateAvatarStyle":
      return Page.ProfileUpdateAvatarStyle.view(page.child);

    case "ProfileUpdateName":
      return Page.ProfileUpdateName.view(page.child);

    case "ProfileUpdateUsername":
      return Page.ProfileUpdateUsername.view(page.child);

    case "TicTacToe":
      return Page.TicTacToe.view(page.child);

    default:
      return exhaustive(page);
  }
};

//
//
//
// Location
//
//
//

const locationToMsg = (location: navigation.Location): Msg => {
  return { group: "Main", type: "LocationChanged", location: location };
};

//
//
//
// Main
//
//
//

const main = () => {
  const Program =
    process.env.NODE_ENV === "production"
      ? navigation.program
      : programWithDebugger;

  const program = Program(locationToMsg, init, update, view, subscriptions);

  const rootElement = document.getElementById("root");

  if (rootElement) {
    const root = createRoot(rootElement);

    react.run(program, (dom) => {
      root.render(dom);
    });
  }
};

//
//
//

main();
