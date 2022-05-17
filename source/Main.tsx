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

/* 

888b     d888               888          888 
8888b   d8888               888          888 
88888b.d88888               888          888 
888Y88888P888  .d88b.   .d88888  .d88b.  888 
888 Y888P 888 d88""88b d88" 888 d8P  Y8b 888 
888  Y8P  888 888  888 888  888 88888888 888 
888   "   888 Y88..88P Y88b 888 Y8b.     888 
888       888  "Y88P"   "Y88888  "Y8888  888 

*/

export type Model =
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

/* 

d8b          d8b 888
Y8P          Y8P 888
                 888
888 88888b.  888 888888
888 888 "88b 888 888
888 888  888 888 888
888 888  888 888 Y88b.
888 888  888 888  "Y888

*/

export const init = (location: navigation.Location): [Model, cmd.Cmd<Msg>] => [
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

const initReady = ({
  location,
  profile,
}: {
  location: Location;
  profile: Profile;
}): [ReadyModel, cmd.Cmd<Msg>] => {
  const [page, pageCmd] = initReadyPage(profile, location);
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

const initReadyPage = (
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

/* 

888b     d888                   
8888b   d8888                   
88888b.d88888                   
888Y88888P888 .d8888b   .d88b.  
888 Y888P 888 88K      d88P"88b 
888  Y8P  888 "Y8888b. 888  888 
888   "   888      X88 Y88b 888 
888       888  88888P'  "Y88888 
                            888 
                       Y8b d88P 
                        "Y88P"  

*/

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

/* 

888     888               888          888
888     888               888          888
888     888               888          888
888     888 88888b.   .d88888  8888b.  888888 .d88b.
888     888 888 "88b d88" 888     "88b 888   d8P  Y8b
888     888 888  888 888  888 .d888888 888   88888888
Y88b. .d88P 888 d88P Y88b 888 888  888 Y88b. Y8b.
 "Y88888P"  88888P"   "Y88888 "Y888888  "Y888 "Y8888
            888
            888
            888
*/

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
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
  switch (msg.group) {
    case "Main":
      switch (msg.type) {
        case "LocationChanged":
          return [{ ...model, location: msg.location }, cmd.none];

        case "ProfileFound":
          return initReady({ location: model.location, profile: msg.profile });

        default:
          return [model, cmd.none];
      }
    default: {
      switch (model.page.type) {
        case "Logout":
          if (msg.group === "Logout") {
            const [child, childCmd] = Page.Logout.update(msg, model.page.child);
            return [{ ...model, page: { type: "Logout", child } }, childCmd];
          }
          return [model, cmd.none];

        case "ProfileCreate":
          if (msg.group === "ProfileCreate") {
            const [child, childCmd] = Page.ProfileCreate.update(
              model,
              msg,
              model.page.child
            );
            return [
              { ...model, page: { type: "ProfileCreate", child } },
              childCmd,
            ];
          }
          return [model, cmd.none];
      }
    }
  }
};

const updateSessionMissing = (
  msg: Msg,
  model: SessionMissingModel
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Main":
      switch (msg.type) {
        case "LocationChanged":
          return [{ ...model, location: msg.location }, cmd.none];

        case "SessionFound":
          return initProfileLoading({ session: msg, location: model.location });

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
  switch (msg.group) {
    case "Main":
      switch (msg.type) {
        case "LocationChanged":
          const [page, pageCmd] = initReadyPage(model.profile, msg.location);
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
    default: {
      const [page, pageCmd] = updateReadyPage(model.profile, msg, model.page);
      return [{ ...model, page }, pageCmd];
    }
  }
};

const updateReadyPage = (
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
        return [{ type: "TicTacToe", child }, childCmd];
      }
      return [page, cmd.none];

    default:
      return exhaustive(page);
  }
};

/* 

 .d8888b.           888                                d8b          888    d8b                            
d88P  Y88b          888                                Y8P          888    Y8P                            
Y88b.               888                                             888                                   
 "Y888b.   888  888 88888b.  .d8888b   .d8888b 888d888 888 88888b.  888888 888  .d88b.  88888b.  .d8888b  
    "Y88b. 888  888 888 "88b 88K      d88P"    888P"   888 888 "88b 888    888 d88""88b 888 "88b 88K      
      "888 888  888 888  888 "Y8888b. 888      888     888 888  888 888    888 888  888 888  888 "Y8888b. 
Y88b  d88P Y88b 888 888 d88P      X88 Y88b.    888     888 888 d88P Y88b.  888 Y88..88P 888  888      X88 
 "Y8888P"   "Y88888 88888P"   88888P'  "Y8888P 888     888 88888P"   "Y888 888  "Y88P"  888  888  88888P' 
                                                           888                                            
                                                           888                                            
                                                           888                                            
*/

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

/* 

888     888 d8b                        
888     888 Y8P                        
888     888                            
Y88b   d88P 888  .d88b.  888  888  888 
 Y88b d88P  888 d8P  Y8b 888  888  888 
  Y88o88P   888 88888888 888  888  888 
   Y888P    888 Y8b.     Y88b 888 d88P 
    Y8P     888  "Y8888   "Y8888888P"  

*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    <View.ThemeProvider>{viewMain(model)(dispatch)}</View.ThemeProvider>;

export const viewMain = (model: Model): react.Html<Msg> => {
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
      return Page.TicTacToe.view(page.child);

    default:
      return exhaustive(page);
  }
};

/* 

888b     d888          d8b          
8888b   d8888          Y8P          
88888b.d88888                       
888Y88888P888  8888b.  888 88888b.  
888 Y888P 888     "88b 888 888 "88b 
888  Y8P  888 .d888888 888 888  888 
888   "   888 888  888 888 888  888 
888       888 "Y888888 888 888  888 

*/

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

/* 

888               888                                    
888               888                                    
888               888                                    
88888b.   .d88b.  888 88888b.   .d88b.  888d888 .d8888b  
888 "88b d8P  Y8b 888 888 "88b d8P  Y8b 888P"   88K      
888  888 88888888 888 888  888 88888888 888     "Y8888b. 
888  888 Y8b.     888 888 d88P Y8b.     888          X88 
888  888  "Y8888  888 88888P"   "Y8888  888      88888P' 
                      888                                
                      888                                
                      888                                

*/

const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, cmd.Cmd<Msg>],
    msg: Msg
  ) =>
  ([model, cmdPrev]: [Model, cmd.Cmd<Msg>]): [Model, cmd.Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };
