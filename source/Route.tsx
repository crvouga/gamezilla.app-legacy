import { option } from "fp-ts";

//
//
// Model
//
//

export type Route =
  | { type: "Account" }
  | { type: "Home" }
  | { type: "Login" }
  | { type: "Logout" }
  | { type: "ProfileCreate" }
  | { type: "ProfileDelete" }
  | { type: "ProfileUpdate" }
  | { type: "ProfileUpdateAvatar" }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "Game" };

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
  Game: "Game",
};

const isRouteType = (routeType: unknown): routeType is Route["type"] => {
  return typeof routeType === "string" && routeType in routesTypes;
};

export const decode = (pathname: string): option.Option<Route> => {
  const [part0] = pathname.substring(1).split("/");

  if (!isRouteType(part0)) {
    return option.none;
  }

  return option.some({ type: part0 });
};

export const encode = (route: Route): string => {
  return route.type;
};
