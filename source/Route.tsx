import { pipe } from "fp-ts/lib/function";
import { sub } from "Framework";
import * as Navigation from "Framework/Navigation";
import { Sub } from "Framework/Sub";

//
//
// Model
//
//

export type Model = Route;

export type Route =
  | Account
  | Home
  | Login
  | Logout
  | ProfileCreate
  | ProfileDelete
  | ProfileUpdate
  | ProfileUpdateAvatar
  | ProfileUpdateName
  | ProfileUpdateUsername
  | ProfileUpdateTheme
  | Game
  | Chat
  | ChatNew;

export type Account = { type: "Account" };
export type Home = { type: "Home" };
export type Login = { type: "Login" };
export type Logout = { type: "Logout" };
export type ProfileCreate = { type: "ProfileCreate" };
export type ProfileDelete = { type: "ProfileDelete" };
export type ProfileUpdate = { type: "ProfileUpdate" };
export type ProfileUpdateAvatar = { type: "ProfileUpdateAvatar" };
export type ProfileUpdateName = { type: "ProfileUpdateName" };
export type ProfileUpdateUsername = { type: "ProfileUpdateUsername" };
export type ProfileUpdateTheme = { type: "ProfileUpdateTheme" };
export type Game = { type: "Game" };
export type Chat = { type: "Chat" };
export type ChatNew = { type: "ChatNew" };

//
//
// encode/decode
//
//

const routesTypes: { [routeType in Route["type"]]: string } = {
  Account: "Account",
  Home: "Home",
  Login: "Login",
  Logout: "Logout",
  ProfileCreate: "ProfileCreate",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  ProfileUpdateTheme: "ProfileUpdateTheme",
  Game: "Game",
  Chat: "Chat",
  ChatNew: "ChatNew",
};

const isRouteType = (routeType: unknown): routeType is Route["type"] => {
  return typeof routeType === "string" && routeType in routesTypes;
};

export const decode = (pathname: string): Route | undefined => {
  const [part0] = pathname.substring(1).split("/");

  if (isRouteType(part0)) {
    return { type: part0 };
  }

  return undefined;
};

export const encode = (route: Route): string => {
  return route.type;
};

//
//
//
// Subscriptions
//
//
//

export type GroupedMsg = Msg & { group: "Route" };

export type Msg = RecievedRoute;

const RecievedRouteChange = (route: Route) =>
  ({ type: "RecievedRouteChange", route } as const);

type RecievedRoute = ReturnType<typeof RecievedRouteChange>;

export const subscriptions = (): Sub<Msg> => {
  return pipe(
    Navigation.subscription,
    sub.map((location) => {
      const route = decode(location.pathname) ?? { type: "Home" };
      return RecievedRouteChange(route);
    })
  );
};

//
//
//
// Navigation
//
//
//

export const push = <TMsg,>(route: Route) => {
  return Navigation.push<TMsg>(encode(route));
};
