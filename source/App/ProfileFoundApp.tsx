import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import { cmd, react } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Page from "../Page";
import * as Profile from "../Profile";

/* 


Model


*/

export type Model =
  | { type: "Account"; child: Page.Account.Model }
  | { type: "Chess"; child: Page.Chess.Model }
  | { type: "ConnectFour"; child: Page.ConnectFour.Model }
  | { type: "Home"; child: Page.Home.Model }
  | { type: "Logout"; child: Page.Logout.Model }
  | { type: "ProfileDelete"; child: Page.ProfileDelete.Model }
  | { type: "ProfileUpdate"; child: Page.ProfileUpdate.Model }
  | { type: "ProfileUpdateAvatar"; child: Page.ProfileUpdateAvatar.Model }
  | { type: "ProfileUpdateName"; child: Page.ProfileUpdateName.Model }
  | { type: "ProfileUpdateUsername"; child: Page.ProfileUpdateUsername.Model }
  | { type: "TicTacToe"; child: Page.TicTacToe.Model };

const routes: { [routeType in Model["type"]]: string } = {
  Account: "Account",
  Chess: "Chess",
  ConnectFour: "ConnectFour",
  Home: "Home",
  Logout: "Logout",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  TicTacToe: "TicTacToe",
};

const isRoute = (route: string): route is Model["type"] => {
  return route in routes;
};

export const decode = (location: { pathname: string }) => {
  const url = location.pathname.substring(1);

  if (isRoute(url)) {
    return Option.some(url);
  }

  return Option.none;
};

const encode = (modelType: Model["type"]): string => {
  return modelType;
};

export const init = (
  location: { pathname: string },
  profile: Profile.Profile
): [Model, cmd.Cmd<Msg>] => {
  const route = decode(location);

  if (Option.isNone(route)) {
    return [
      { type: "Home", child: Page.Home.init },
      Navigation.replace(encode("Home")),
    ];
  }

  switch (route.value) {
    case "Account":
      return [{ type: "Account", child: Page.Account.init }, cmd.none];

    case "Chess":
      return [{ type: "Chess", child: Page.Chess.init }, cmd.none];

    case "ConnectFour":
      return [{ type: "ConnectFour", child: Page.ConnectFour.init }, cmd.none];

    case "Home":
      return [{ type: "Home", child: Page.Home.init }, cmd.none];

    case "Logout":
      return [{ type: "Logout", child: Page.Logout.init }, cmd.none];

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
      return [
        {
          type: "TicTacToe",
          child: Page.TicTacToe.init,
        },
        cmd.none,
      ];
  }
};

/* 



Update



*/

export type Msg =
  | { type: "LocationChanged"; location: { pathname: string } }
  | { type: "AccountPageMsg"; msg: Page.Account.Msg }
  | { type: "ChessPageMsg"; msg: Page.Chess.Msg }
  | { type: "ConnectFourPageMsg"; msg: Page.ConnectFour.Msg }
  | { type: "HomePageMsg"; msg: Page.Home.Msg }
  | { type: "LogoutPageMsg"; msg: Page.Logout.Msg }
  | { type: "ProfileDeletePageMsg"; msg: Page.ProfileDelete.Msg }
  | { type: "ProfileUpdatePageMsg"; msg: Page.ProfileUpdate.Msg }
  | { type: "ProfileUpdateAvatarPageMsg"; msg: Page.ProfileUpdateAvatar.Msg }
  | { type: "ProfileUpdateNamePageMsg"; msg: Page.ProfileUpdateName.Msg }
  | {
      type: "ProfileUpdateUsernamePageMsg";
      msg: Page.ProfileUpdateUsername.Msg;
    }
  | { type: "TicTacToePageMsg"; msg: Page.TicTacToe.Msg }
  | { type: "NotFoundPageMsg" };

export const update = (
  profile: Profile.Profile,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  if (msg.type === "LocationChanged") {
    return init(msg.location, profile);
  }

  switch (model.type) {
    case "Account":
      if (msg.type === "AccountPageMsg") {
        const [childModel, childCmd] = Page.Account.update(
          msg.msg,
          model.child
        );
        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "AccountPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "Chess":
      if (msg.type === "ChessPageMsg") {
        const [childModel, childCmd] = Page.Chess.update(msg.msg, model.child);

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ChessPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ConnectFour":
      if (msg.type === "ConnectFourPageMsg") {
        const [childModel, childCmd] = Page.ConnectFour.update(
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ConnectFourPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "Home":
      if (msg.type === "HomePageMsg") {
        const [childModel, childCmd] = Page.Home.update(msg.msg, model.child);

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "HomePageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "Logout":
      if (msg.type === "LogoutPageMsg") {
        const [childModel, childCmd] = Page.Logout.update(msg.msg, model.child);

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "LogoutPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileDelete":
      if (msg.type === "ProfileDeletePageMsg") {
        const [childModel, childCmd] = Page.ProfileDelete.update(
          profile,
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ProfileDeletePageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileUpdate":
      if (msg.type === "ProfileUpdatePageMsg") {
        const [childModel, childCmd] = Page.ProfileUpdate.update(
          profile,
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ProfileUpdatePageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileUpdateAvatar":
      if (msg.type === "ProfileUpdateAvatarPageMsg") {
        const [childModel, childCmd] = Page.ProfileUpdateAvatar.update(
          profile,
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ProfileUpdateAvatarPageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileUpdateName":
      if (msg.type === "ProfileUpdateNamePageMsg") {
        const [childModel, childCmd] = Page.ProfileUpdateName.update(
          profile,
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ProfileUpdateNamePageMsg", msg }))
          ),
        ];
      }

      return [model, cmd.none];

    case "ProfileUpdateUsername":
      if (msg.type === "ProfileUpdateUsernamePageMsg") {
        const [childModel, childCmd] = Page.ProfileUpdateUsername.update(
          profile,
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({
              type: "ProfileUpdateUsernamePageMsg",
              msg,
            }))
          ),
        ];
      }

      return [model, cmd.none];

    case "TicTacToe":
      if (msg.type === "TicTacToePageMsg") {
        const [childModel, childCmd] = Page.TicTacToe.update(
          msg.msg,
          model.child
        );

        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({
              type: "TicTacToePageMsg",
              msg,
            }))
          ),
        ];
      }
      return [model, cmd.none];
  }
};

/* 



View



*/

export const view = (
  profile: Profile.Profile,
  model: Model
): react.Html<Msg> => {
  switch (model.type) {
    case "Account":
      return pipe(
        Page.Account.view(profile, model.child),
        react.map((msg) => ({ type: "AccountPageMsg", msg }))
      );

    case "Chess":
      return pipe(
        Page.Chess.view(model.child),
        react.map((msg) => ({ type: "ChessPageMsg", msg }))
      );

    case "ConnectFour":
      return pipe(
        Page.ConnectFour.view(model.child),
        react.map((msg) => ({ type: "ConnectFourPageMsg", msg }))
      );

    case "Home":
      return pipe(
        Page.Home.view(profile, model.child),
        react.map((msg) => ({ type: "HomePageMsg", msg }))
      );

    case "Logout":
      return pipe(
        Page.Logout.view(model.child),
        react.map((msg) => ({ type: "LogoutPageMsg", msg }))
      );

    case "ProfileDelete":
      return pipe(
        Page.ProfileDelete.view(model.child),
        react.map((msg) => ({ type: "ProfileDeletePageMsg", msg }))
      );

    case "ProfileUpdate":
      return pipe(
        Page.ProfileUpdate.view(profile, model.child),
        react.map((msg) => ({ type: "ProfileUpdatePageMsg", msg }))
      );

    case "ProfileUpdateAvatar":
      return pipe(
        Page.ProfileUpdateAvatar.view(profile, model.child),
        react.map((msg) => ({ type: "ProfileUpdateAvatarPageMsg", msg }))
      );

    case "ProfileUpdateName":
      return pipe(
        Page.ProfileUpdateName.view(model.child),
        react.map((msg) => ({ type: "ProfileUpdateNamePageMsg", msg }))
      );

    case "ProfileUpdateUsername":
      return pipe(
        Page.ProfileUpdateUsername.view(model.child),
        react.map((msg) => ({ type: "ProfileUpdateUsernamePageMsg", msg }))
      );

    case "TicTacToe":
      return pipe(
        Page.TicTacToe.view(model.child),
        react.map((msg) => ({ type: "TicTacToePageMsg", msg }))
      );
  }
};
