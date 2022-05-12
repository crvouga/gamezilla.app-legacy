import * as Account from "./Account";
import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Home from "./Home";
import * as Login from "./Login";
import * as Logout from "./Logout";
import * as ProfileCreate from "./ProfileCreate";
import * as ProfileDelete from "./ProfileDelete";
import * as ProfileUpdate from "./ProfileUpdate";
import * as ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import * as ProfileUpdateAvatarStyle from "./ProfileUpdateAvatarStyle";
import * as ProfileUpdateName from "./ProfileUpdateName";
import * as ProfileUpdateUsername from "./ProfileUpdateUsername";
import * as TicTacToe from "./TicTacToe";

import * as React from "react";
import { cmd, react, sub } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Profile from "../Profile";
import * as Session from "../Session";
import * as View from "../View";
import * as Page from "../Page";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Login"; child: Login.Model }
  | { type: "Home"; child: Home.Model };

export const init = (_: Navigation.Location): [Model, cmd.Cmd<Msg>] => {
  return [{ type: "Login", child: Page.Login.init() }, cmd.none];
};

//
//
//
// Update
//
//
//

export type Msg =
  | {
      group: "Location";
      type: "LocationChanged";
      location: { pathname: string };
    }
  | Login.Msg
  | Home.Msg;

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    group: "Location",
    type: "LocationChanged",
    location: { pathname: location.pathname },
  };
};

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Location":
      switch (msg.location.pathname) {
        case "/Home":
          return [{ type: "Home", child: Home.init }, cmd.none];

        default:
          return [model, cmd.none];
      }

    case "Home":
      if (model.type === "Home") {
        const [child, childCmd] = Home.update(msg, model.child);

        return [{ type: "Home", child }, childCmd];
      }

      return [model, cmd.none];

    case "Login":
      if (model.type === "Login") {
        const [child, childCmd] = Login.update(msg, model.child);

        return [{ type: "Login", child }, childCmd];
      }

      return [model, cmd.none];
  }
};

export const navigate = <Msg>(location: { type: Model["type"] }) => {
  return Navigation.push<Msg>(location.type);
};

export {
  Account,
  Chess,
  ConnectFour,
  Home,
  Login,
  Logout,
  ProfileCreate,
  ProfileDelete,
  ProfileUpdate,
  ProfileUpdateAvatar,
  ProfileUpdateAvatarStyle,
  ProfileUpdateName,
  ProfileUpdateUsername,
  TicTacToe,
};
