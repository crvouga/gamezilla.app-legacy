import React from "react";
import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "./Framework";
import * as Pages from "./Pages";

// ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝

export type Model = SessionLoading | SessionMissing | SessionFound;

type SessionLoading = { type: "SessionLoading" };

type SessionMissing = { type: "SessionMissing"; session: Session };

type SessionFound = {
  type: "SessionFound";
  session: Session;
  child: ProfileLoading | ProfileMissing | ProfileFound;
};

type ProfileLoading = { type: "ProfileLoading" };

type ProfileMissing = { type: "ProfileMissing" };

type ProfileFound = { type: "ProfileFound"; profile: Profile; child: Route };

type Route =
  | {
      type: "/home";
      page: Pages.Home.Model;
    }
  | {
      type: "/account";
      page: Pages.Account.Model;
    }
  | {
      type: "/chess";
      page: Pages.Chess.Model;
    }
  | {
      type: "/connect-four";
      page: Pages.ConnectFour.Model;
    }
  | {
      type: "/logout";
      page: Pages.Logout.Model;
    }
  | {
      type: "/profile";
      child:
        | {
            type: "/delete";
            page: Pages.ProfileDelete.Model;
          }
        | {
            type: "/update";
            page: Pages.ProfileUpdate.Model;
            child:
              | {
                  type: "/";
                }
              | {
                  type: "/username";
                  page: Pages.ProfileUpdateUsername.Model;
                }
              | {
                  type: "/name";
                  page: Pages.ProfileUpdateName.Model;
                }
              | {
                  type: "/avatar";
                  page: Pages.ProfileUpdateAvatar.Model;
                  child:
                    | {
                        type: "/";
                      }
                    | {
                        type: "/style";
                      }
                    | {
                        type: "/seed";
                      };
                };
          };
    };

type Session = { userId: string; defaultName: string };

type Profile = { userId: string; avtarUrl: string; name: string };

// ██╗███╗   ██╗██╗████████╗
// ██║████╗  ██║██║╚══██╔══╝
// ██║██╔██╗ ██║██║   ██║
// ██║██║╚██╗██║██║   ██║
// ██║██║ ╚████║██║   ██║
// ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝

// ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
// ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
// ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
// ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝

export type Msg =
  | { group: "Main"; type: "LocationChanged"; location: Location }
  | { group: "Main"; type: "SessionFound"; userId: string; defaultName: string }
  | { group: "Main"; type: "SessionNotFound" }
  | { group: "Main"; type: "ProfileFound"; profile: Profile }
  | { group: "Main"; type: "ProfileNotFound" }
  | ({ group: "Account" } & Pages.Account.Msg)
  | ({ group: "Chess" } & Pages.Chess.Msg)
  | ({ group: "ConnectFour" } & Pages.ConnectFour.Msg)
  | ({ group: "Home" } & Pages.Home.Msg)
  | ({ group: "Login" } & Pages.Login.Msg)
  | ({ group: "Logout" } & Pages.Logout.Msg)
  | ({ group: "ProfileCreate" } & Pages.ProfileCreate.Msg)
  | ({ group: "ProfileDelete" } & Pages.ProfileDelete.Msg)
  | ({ group: "ProfileUpdate" } & Pages.ProfileUpdate.Msg)
  | ({ group: "ProfileUpdateAvatar" } & Pages.ProfileUpdateAvatar.Msg)
  | ({ group: "ProfileUpdateName" } & Pages.ProfileUpdateName.Msg)
  | ({ group: "ProfileUpdateUsername" } & Pages.ProfileUpdateUsername.Msg)
  | ({ group: "TicTacToe" } & Pages.TicTacToe.Msg);

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "SessionFound":
      return updateSessionFound(msg, model);

    case "SessionMissing":
      return [model, cmd.none];

    case "SessionLoading":
      return [model, cmd.none];
  }
};

export const updateSessionFound = (
  msg: Msg,
  model: SessionFound
): [SessionMissing | SessionFound, cmd.Cmd<Msg>] => {
  switch (model.child.type) {
    case "ProfileFound":
      const [child, childCmd] = updateProfileFound(msg, model.child);
      return [{ ...model, child }, childCmd];

    case "ProfileLoading":
      return [model, cmd.none];

    case "ProfileMissing":
      return [model, cmd.none];
  }
};

export const updateProfileFound = (
  msg: Msg,
  model: ProfileFound
): [ProfileFound, cmd.Cmd<Msg>] => {
  switch (model.child.type) {
    case "/account":
      if (msg.group === "Account") {
        const [page, pageCmd] = Pages.Account.update(
          model.profile,
          msg,
          model.child.page
        );
        return [{ ...model, child: { ...model.child, page: page } }, pageCmd];
      }
      return [model, cmd.none];

    case "/chess":
      return [model, cmd.none];

    case "/connect-four":
      return [model, cmd.none];

    case "/home":
      return [model, cmd.none];

    case "/logout":
      return [model, cmd.none];

    case "/profile":
      switch (model.child.child.type) {
        case "/delete":
          return [model, cmd.none];

        case "/update":
          switch (model.child.child.child.type) {
            case "/":
              return [model, cmd.none];

            case "/avatar":
              switch (model.child.child.child.child.type) {
                case "/":
                  return [model, cmd.none];

                case "/seed":
                  return [model, cmd.none];

                case "/style":
                  return [model, cmd.none];
              }

            case "/name":
              return [model, cmd.none];

            case "/username":
              return [model, cmd.none];
          }
      }
  }
};

// ██╗   ██╗██╗███████╗██╗    ██╗
// ██║   ██║██║██╔════╝██║    ██║
// ██║   ██║██║█████╗  ██║ █╗ ██║
// ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝

const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "SessionLoading":
      return () => <>session loading</>;

    case "SessionMissing":
      return () => <>session missing</>;

    case "SessionFound":
      switch (model.child.type) {
        case "ProfileLoading":
          return () => <>profile loading</>;

        case "ProfileMissing":
          return () => <>profile missing</>;

        case "ProfileFound":
          switch (model.child.child.type) {
            case "/account":
              return () => <>/account</>;

            case "/chess":
              return () => <>/account</>;

            case "/connect-four":
              return () => <>/connect four</>;

            case "/home":
              return () => <>/home</>;

            case "/logout":
              return () => <>/logout</>;

            case "/profile":
              switch (model.child.child.child.type) {
                case "/delete":
                  return () => <>/profile/delete</>;

                case "/update":
                  return () => <>/profile/update</>;
              }
          }
      }
  }
};

// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝

const andThen =
  <Msg, Model>(update: (model: Model) => [Model, cmd.Cmd<Msg>]) =>
  ([model, cmdPrev]: [Model, cmd.Cmd<Msg>]): [Model, cmd.Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(model);

    return [modelNew, cmd.batch([cmdPrev, cmdNew])];
  };

const groupMsg =
  <Msg, Group extends string>(group: Group) =>
  (msg: Msg): Msg & { group: Group } => {
    return { ...msg, group: group } as const;
  };
