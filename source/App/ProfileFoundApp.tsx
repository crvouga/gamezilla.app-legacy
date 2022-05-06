import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Page from "../Page";
import * as Profile from "../Profile";

/* 


Model


*/

export type Model =
  | { type: "Account"; model: Page.Account.Model }
  | { type: "Chess"; model: Page.Chess.Model }
  | { type: "ConnectFour"; model: Page.ConnectFour.Model }
  | { type: "Home"; model: Page.Home.Model }
  | { type: "Logout"; model: Page.Logout.Model }
  | { type: "ProfileDelete"; model: Page.ProfileDelete.Model }
  | { type: "ProfileUpdate"; model: Page.ProfileUpdate.Model }
  | { type: "ProfileUpdateAvatar"; model: Page.ProfileUpdateAvatar.Model }
  | { type: "ProfileUpdateName"; model: Page.ProfileUpdateName.Model }
  | { type: "ProfileUpdateUsername"; model: Page.ProfileUpdateUsername.Model }
  | { type: "TicTacToe"; model: Page.TicTacToe.Model }
  | { type: "NotFound" };

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
  NotFound: "NotFound",
};

const isRoute = (route: string): route is Model["type"] => {
  return route in routes;
};

export const decode = (url: string) => {
  if (isRoute(url)) {
    return url;
  }

  return "NotFound";
};

export const init = (
  url: string,
  profile: Profile.Profile
): [Model, cmd.Cmd<Msg>] => {
  const route = decode(url);

  switch (route) {
    case "Account":
      return [{ type: "Account", model: Page.Account.init }, cmd.none];

    case "Chess":
      return [{ type: "Chess", model: Page.Chess.init }, cmd.none];

    case "ConnectFour":
      return [{ type: "ConnectFour", model: Page.ConnectFour.init }, cmd.none];

    case "Home":
      return [{ type: "Home", model: Page.Home.init }, cmd.none];

    case "Logout":
      return [{ type: "Logout", model: Page.Logout.init }, cmd.none];

    case "NotFound":
      return [{ type: "Home", model: Page.Home.init }, cmd.none];

    case "ProfileDelete":
      return [
        { type: "ProfileDelete", model: Page.ProfileDelete.init },
        cmd.none,
      ];

    case "ProfileUpdate":
      return [
        { type: "ProfileUpdate", model: Page.ProfileUpdate.init(profile) },
        cmd.none,
      ];

    case "ProfileUpdateAvatar":
      return [
        {
          type: "ProfileUpdateAvatar",
          model: Page.ProfileUpdateAvatar.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateName":
      return [
        {
          type: "ProfileUpdateName",
          model: Page.ProfileUpdateName.init(profile),
        },
        cmd.none,
      ];

    case "ProfileUpdateUsername":
      return [
        {
          type: "ProfileUpdateUsername",
          model: Page.ProfileUpdateUsername.init(profile),
        },
        cmd.none,
      ];

    case "TicTacToe":
      return [
        {
          type: "TicTacToe",
          model: Page.TicTacToe.init,
        },
        cmd.none,
      ];
  }
};

/* 



Update



*/

export type Msg =
  | { type: "AccountMsg"; msg: Page.Account.Msg }
  | { type: "ChessMsg"; msg: Page.Chess.Msg }
  | { type: "ConnectFourMsg"; msg: Page.ConnectFour.Msg }
  | { type: "HomeMsg"; msg: Page.Home.Msg }
  | { type: "LogoutMsg"; msg: Page.Logout.Msg }
  | { type: "ProfileDeleteMsg"; msg: Page.ProfileDelete.Msg }
  | { type: "ProfileUpdateMsg"; msg: Page.ProfileUpdate.Msg }
  | { type: "ProfileUpdateAvatarMsg"; msg: Page.ProfileUpdateAvatar.Msg }
  | { type: "ProfileUpdateNameMsg"; msg: Page.ProfileUpdateName.Msg }
  | { type: "ProfileUpdateUsernameMsg"; msg: Page.ProfileUpdateUsername.Msg }
  | { type: "TicTacToeMsg"; msg: Page.TicTacToe.Msg }
  | { type: "NotFoundMsg" };

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
        Page.Account.view(profile, model.model),
        react.map((msg) => ({ type: "AccountMsg", msg }))
      );

    case "Chess":
      return pipe(
        Page.Chess.view(model.model),
        react.map((msg) => ({ type: "ChessMsg", msg }))
      );

    case "ConnectFour":
      return pipe(
        Page.ConnectFour.view(model.model),
        react.map((msg) => ({ type: "ConnectFourMsg", msg }))
      );

    case "Home":
      return pipe(
        Page.Home.view(profile, model.model),
        react.map((msg) => ({ type: "HomeMsg", msg }))
      );

    case "Logout":
      return pipe(
        Page.Logout.view(model.model),
        react.map((msg) => ({ type: "LogoutMsg", msg }))
      );

    case "ProfileDelete":
      return pipe(
        Page.ProfileDelete.view(model.model),
        react.map((msg) => ({ type: "ProfileDeleteMsg", msg }))
      );

    case "ProfileUpdate":
      return pipe(
        Page.ProfileUpdate.view(profile, model.model),
        react.map((msg) => ({ type: "ProfileUpdateMsg", msg }))
      );

    case "ProfileUpdateAvatar":
      return pipe(
        Page.ProfileUpdateAvatar.view(profile, model.model),
        react.map((msg) => ({ type: "ProfileUpdateAvatarMsg", msg }))
      );

    case "ProfileUpdateName":
      return pipe(
        Page.ProfileUpdateName.view(model.model),
        react.map((msg) => ({ type: "ProfileUpdateNameMsg", msg }))
      );

    case "ProfileUpdateUsername":
      return pipe(
        Page.ProfileUpdateUsername.view(model.model),
        react.map((msg) => ({ type: "ProfileUpdateUsernameMsg", msg }))
      );

    case "TicTacToe":
      return pipe(
        Page.TicTacToe.view(model.model),
        react.map((msg) => ({ type: "TicTacToeMsg", msg }))
      );

    case "NotFound":
      return () => <>Not Found</>;
  }
};
