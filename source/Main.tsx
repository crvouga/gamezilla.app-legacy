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

//                                           88              88
//                                           88              88
//                                           88              88
// 88,dPYba,,adPYba,    ,adPPYba,    ,adPPYb,88   ,adPPYba,  88
// 88P'   "88"    "8a  a8"     "8a  a8"    `Y88  a8P_____88  88
// 88      88      88  8b       d8  8b       88  8PP"""""""  88
// 88      88      88  "8a,   ,a8"  "8a,   ,d88  "8b,   ,aa  88
// 88      88      88   `"YbbdP"'    `"8bbdP"Y8   `"Ybbd8"'  88

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
  page: { type: "Login"; child: Page.Login.Model };
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
    | { type: "ProfileCreate"; child: Page.ProfileCreate.Model }
    | { type: "Logout"; child: Page.Logout.Model };
};

type ReadyModel = {
  type: "Ready";
  location: Location;
  profile: Profile;
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

type Profile = {
  name: string;
  avatarUrl: string;
  username: string;
  userId: string;
};

// 88               88
// ""               ""    ,d
//                        88
// 88  8b,dPPYba,   88  MM88MMM
// 88  88P'   `"8a  88    88
// 88  88       88  88    88
// 88  88       88  88    88,
// 88  88       88  88    "Y888

const init = (location: navigation.Location): [Model, cmd.Cmd<Msg>] => [
  { type: "SessionLoading", location: location },
  pipe(Session.load(), perform(maybeSessionToMsg)),
];

const initSessionMissing = (
  location: Location
): [SessionMissingModel, cmd.Cmd<Msg>] => {
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
        child: Page.ProfileCreate.init(deps),
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

//                                    88
//                                    88                ,d
//                                    88                88
// 88       88  8b,dPPYba,    ,adPPYb,88  ,adPPYYba,  MM88MMM  ,adPPYba,
// 88       88  88P'    "8a  a8"    `Y88  ""     `Y8    88    a8P_____88
// 88       88  88       d8  8b       88  ,adPPPPP88    88    8PP"""""""
// "8a,   ,a88  88b,   ,a8"  "8a,   ,d88  88,    ,88    88,   "8b,   ,aa
//  `"YbbdP'Y8  88`YbbdP"'    `"8bbdP"Y8  `"8bbdP"Y8    "Y888  `"Ybbd8"'
//              88
//              88

type Msg =
  | { group: "Main"; type: "LocationChanged"; location: Location }
  | { group: "Main"; type: "SessionFound"; userId: string; defaultName: string }
  | { group: "Main"; type: "SessionNotFound" }
  | { group: "Main"; type: "ProfileFound"; profile: Profile }
  | { group: "Main"; type: "ProfileNotFound" }
  | PageMsg;

type PageMsg =
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
  | (Page.TicTacToe.Msg & { group: "TicTacToe" });

const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  return pipe(
    [model, cmd.none],
    andThen(updateMain, msg),
    andThen(updatePage, msg)
  );
};

//                                    88                                                                     88
//                                    88                ,d                                                   ""
//                                    88                88
// 88       88  8b,dPPYba,    ,adPPYb,88  ,adPPYYba,  MM88MMM  ,adPPYba,     88,dPYba,,adPYba,   ,adPPYYba,  88  8b,dPPYba,
// 88       88  88P'    "8a  a8"    `Y88  ""     `Y8    88    a8P_____88     88P'   "88"    "8a  ""     `Y8  88  88P'   `"8a
// 88       88  88       d8  8b       88  ,adPPPPP88    88    8PP"""""""     88      88      88  ,adPPPPP88  88  88       88
// "8a,   ,a88  88b,   ,a8"  "8a,   ,d88  88,    ,88    88,   "8b,   ,aa     88      88      88  88,    ,88  88  88       88
//  `"YbbdP'Y8  88`YbbdP"'    `"8bbdP"Y8  `"8bbdP"Y8    "Y888  `"Ybbd8"'     88      88      88  `"8bbdP"Y8  88  88       88
//              88
//              88

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

//                                    88
//                                    88                ,d
//                                    88                88
// 88       88  8b,dPPYba,    ,adPPYb,88  ,adPPYYba,  MM88MMM  ,adPPYba,     8b,dPPYba,   ,adPPYYba,   ,adPPYb,d8   ,adPPYba,
// 88       88  88P'    "8a  a8"    `Y88  ""     `Y8    88    a8P_____88     88P'    "8a  ""     `Y8  a8"    `Y88  a8P_____88
// 88       88  88       d8  8b       88  ,adPPPPP88    88    8PP"""""""     88       d8  ,adPPPPP88  8b       88  8PP"""""""
// "8a,   ,a88  88b,   ,a8"  "8a,   ,d88  88,    ,88    88,   "8b,   ,aa     88b,   ,a8"  88,    ,88  "8a,   ,d88  "8b,   ,aa
//  `"YbbdP'Y8  88`YbbdP"'    `"8bbdP"Y8  `"8bbdP"Y8    "Y888  `"Ybbd8"'     88`YbbdP"'   `"8bbdP"Y8   `"YbbdP"Y8   `"Ybbd8"'
//              88                                                           88                        aa,    ,88
//              88                                                           88                         "Y8bbdP"

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
      const [modelPage, cmdPage] = updatePageReady(
        model.profile,
        msg,
        model.page
      );
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
        const [child, childCmd] = Page.Login.update(msg, page.child);
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
        const [child, childCmd] = Page.Logout.update(msg, page.child);
        return [{ type: "Logout", child }, childCmd];
      }
      return [page, cmd.none];

    case "ProfileCreate":
      if (msg.group === "ProfileCreate") {
        const [child, childCmd] = Page.ProfileCreate.update(
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
  profile: Profile,
  msg: Msg,
  page: ReadyModel["page"]
): [ReadyModel["page"], cmd.Cmd<Msg>] => {
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

//                         88                                              88                       88
//                         88                                              ""                ,d     ""
//                         88                                                                88
// ,adPPYba,  88       88  88,dPPYba,   ,adPPYba,   ,adPPYba,  8b,dPPYba,  88  8b,dPPYba,  MM88MMM  88   ,adPPYba,   8b,dPPYba,   ,adPPYba,
// I8[    ""  88       88  88P'    "8a  I8[    ""  a8"     ""  88P'   "Y8  88  88P'    "8a   88     88  a8"     "8a  88P'   `"8a  I8[    ""
//  `"Y8ba,   88       88  88       d8   `"Y8ba,   8b          88          88  88       d8   88     88  8b       d8  88       88   `"Y8ba,
// aa    ]8I  "8a,   ,a88  88b,   ,a8"  aa    ]8I  "8a,   ,aa  88          88  88b,   ,a8"   88,    88  "8a,   ,a8"  88       88  aa    ]8I
// `"YbbdP"'   `"YbbdP'Y8  8Y"Ybbd8"'   `"YbbdP"'   `"Ybbd8"'  88          88  88`YbbdP"'    "Y888  88   `"YbbdP"'   88       88  `"YbbdP"'
//                                                                             88
//                                                                             88

const subscriptions = (model: Model): sub.Sub<Msg> => {
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

//              88
//              ""

// 8b       d8  88   ,adPPYba,  8b      db      d8
// `8b     d8'  88  a8P_____88  `8b    d88b    d8'
//  `8b   d8'   88  8PP"""""""   `8b  d8'`8b  d8'
//   `8b,d8'    88  "8b,   ,aa    `8bd8'  `8bd8'
//     "8"      88   `"Ybbd8"'      YP      YP

const view =
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
      return Page.Logout.view(model.page.child);

    case "ProfileCreate":
      return Page.ProfileCreate.view(model.page.child);

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
      return Page.Login.view(model.page.child);

    default:
      return exhaustive(model.page.type);
  }
};

const viewReady = ({ page, profile }: ReadyModel): react.Html<Msg> => {
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
      return pipe(
        Page.TicTacToe.view(page.child),
        react.map(groupMsg("TicTacToe"))
      );

    default:
      return exhaustive(page);
  }
};

//                                 88
//                                 ""

// 88,dPYba,,adPYba,   ,adPPYYba,  88  8b,dPPYba,
// 88P'   "88"    "8a  ""     `Y8  88  88P'   `"8a
// 88      88      88  ,adPPPPP88  88  88       88
// 88      88      88  88,    ,88  88  88       88
// 88      88      88  `"8bbdP"Y8  88  88       88

const locationToMsg = (location: navigation.Location): Msg => {
  return { group: "Main", type: "LocationChanged", location: location };
};

const Program =
  process.env.NODE_ENV === "production"
    ? navigation.program
    : programWithDebugger;

const program = Program(locationToMsg, init, update, view, subscriptions);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root dom node");
}

const root = createRoot(rootElement);

react.run(program, (dom) => {
  root.render(dom);
});

// 88                       88
// 88                       88
// 88                       88
// 88,dPPYba,    ,adPPYba,  88  8b,dPPYba,    ,adPPYba,  8b,dPPYba,  ,adPPYba,
// 88P'    "8a  a8P_____88  88  88P'    "8a  a8P_____88  88P'   "Y8  I8[    ""
// 88       88  8PP"""""""  88  88       d8  8PP"""""""  88           `"Y8ba,
// 88       88  "8b,   ,aa  88  88b,   ,a8"  "8b,   ,aa  88          aa    ]8I
// 88       88   `"Ybbd8"'  88  88`YbbdP"'    `"Ybbd8"'  88          `"YbbdP"'
//                              88
//                              88
// helpers

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
