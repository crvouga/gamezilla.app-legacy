import * as Navigation from "../Framework/Navigation";

export const Routes = {
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
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  TicTacToe: "TicTacToe",
  NotFound: "NotFound",
};

export type Route = keyof typeof Routes;

export const encode = (route: Route): string => {
  return route;
};

const isRoute = (route: string): route is Route => {
  return route in Routes;
};

export const decode = (encoded: string): Route => {
  if (isRoute(encoded)) {
    return encoded;
  }

  return "NotFound";
};

export const push = <Msg,>(route: Route) => {
  return Navigation.push<Msg>(encode(route));
};

export const replace = <Msg,>(route: Route) => {
  return Navigation.replace<Msg>(encode(route));
};
