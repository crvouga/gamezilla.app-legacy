import * as Navigation from "../Framework/Navigation";

export type Route =
  | { type: "Account" }
  | { type: "Chess" }
  | { type: "ConnectFour" }
  | { type: "Home" }
  | { type: "Login" }
  | { type: "Logout" }
  | { type: "ProfileCreate" }
  | { type: "ProfileDelete" }
  | { type: "ProfileUpdate" }
  | { type: "ProfileUpdateAvatar" }
  | { type: "ProfileUpdateAvatarStyle" }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "TicTacToe" }
  | { type: "NotFound" };

const routesTypes: { [routeType in Route["type"]]: string } = {
  Account: "Account",
  Chess: "Chess",
  ConnectFour: "ConnectFour",
  Home: "Home",
  Login: "Login",
  Logout: "Logout",
  ProfileCreate: "ProfileCreate",
  ProfileDelete: "ProfileDelete",
  ProfileUpdate: "ProfileUpdate",
  ProfileUpdateAvatar: "ProfileUpdateAvatar",
  ProfileUpdateAvatarStyle: "ProfileUpdateAvatarStyle",
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  TicTacToe: "TicTacToe",
  NotFound: "NotFound",
};

const isRouteType = (routeType: string): routeType is Route["type"] => {
  return routeType in routesTypes;
};

export const decode = (encoded: string): Route => {
  if (isRouteType(encoded)) {
    return { type: encoded };
  }

  return { type: "NotFound" };
};

export const encode = (route: Route): string => {
  return route.type;
};

export const push = <Msg,>(route: Route) => {
  return Navigation.push<Msg>(encode(route));
};

export const replace = <Msg,>(route: Route) => {
  return Navigation.replace<Msg>(encode(route));
};
