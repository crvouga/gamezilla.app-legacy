import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Page from "../Page";
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

import UrlPattern from "url-pattern";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Home"; child: Home.Model }
  | { type: "Login"; child: Login.Model }
  | { type: "Account"; child: Account.Model };

export const init = (location: Location): [Model, cmd.Cmd<Msg>] => {
  return pipe(
    location,
    decode,
    option.fold<Page, Page>(
      () => ({ type: "Home" }),
      (page) => page
    ),
    initPage
  );
};

const initPage = (page: Page): [Model, cmd.Cmd<Msg>] => {
  switch (page.type) {
    case "Home":
      return [{ type: "Home", child: Home.init }, cmd.none];

    case "Login":
      return [{ type: "Login", child: Login.init() }, cmd.none];

    case "Account":
      return [{ type: "Account", child: Account.init }, cmd.none];
  }
};

//
//
//
// Update
//
//
//

export type Msg = LocationChanged | Login.Msg | Home.Msg | Account.Msg;

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Location":
      return init(msg.location);

    case "Account":
      if (model.type === "Account") {
        const [child, childCmd] = Account.update(msg, model.child);
        return [{ type: "Account", child }, childCmd];
      }
      return [model, cmd.none];

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

//
//
//
// Navigation
//
//
//

type LocationChanged = {
  group: "Location";
  type: "LocationChanged";
  location: Location;
};

type Location = { pathname: string };

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    group: "Location",
    type: "LocationChanged",
    location: { pathname: location.pathname },
  };
};

export const navigate = <Msg>(page: Page) => {
  return Navigation.push<Msg>(encode(page).pathname);
};

const match = (pattern: string, url: string): boolean => {
  return Boolean(new UrlPattern(pattern).match(url));
};

type Page = { type: Model["type"] };

const decode = (location: Location): option.Option<Page> => {
  const { pathname } = location;

  if (match("/home", pathname)) {
    return option.some({ type: "Home" });
  }

  if (match("/login", pathname)) {
    return option.some({ type: "Login" });
  }

  if (match(encode({ type: "Account" }).pathname, pathname)) {
    return option.some({ type: "Account" });
  }

  return option.none;
};

const encode = (page: Page): Location => {
  switch (page.type) {
    case "Home":
      return { pathname: "/home" };

    case "Login":
      return { pathname: "/login" };

    case "Account":
      return { pathname: "/account" };
  }
};

//
//
//
// exports
//
//
//

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
