import { option } from "fp-ts";
import * as Pages from "Pages";

//
//
// Model
//
//

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
  | { type: "ProfileUpdateAvatar"; child: Pages.ProfileUpdateAvatar.Route }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "TicTacToe" };

//
//
// encode/decode
//
//

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
  ProfileUpdateName: "ProfileUpdateName",
  ProfileUpdateUsername: "ProfileUpdateUsername",
  TicTacToe: "TicTacToe",
};

const isRouteType = (routeType: string): routeType is Route["type"] => {
  return routeType in routesTypes;
};

export const decode = (location: {
  pathname: string;
}): option.Option<Route> => {
  const path = location.pathname.substring(1);

  if (isRouteType(path)) {
    switch (path) {
      case "ProfileUpdateAvatar":
        return option.some({ type: path, child: { type: "Main" } });

      default:
        return option.some({ type: path });
    }
  }

  return option.none;
};

export const encode = (route: Route): string => {
  return route.type;
};
