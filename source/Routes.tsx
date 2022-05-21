import { option } from "fp-ts";

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
  | { type: "ProfileUpdateAvatar" }
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
    return option.some({ type: path });
  }

  return option.none;
};

export const encode = (route: Route): string => {
  return route.type;
};

type Leaf = { type: "Index"; _tag: "Leaf" };

export type Route_ =
  | {
      type: "Home";
    }
  | {
      type: "Profile";
      child: {
        type: "Update";
        child:
          | {
              type: "Index";
            }
          | {
              type: "Username";
            }
          | {
              type: "Name";
            }
          | {
              type: "Avatar";
              child:
                | {
                    type: "Index";
                  }
                | {
                    type: "Style";
                  }
                | {
                    type: "Seed";
                  };
            };
      };
    };

// const decode = (url: string) => {
//   const parts = url.split("/");

//   if (parts[0] === "Profile") {
//     if (parts[1] === "Update") {
//       if (parts[2] === "Username") {
//         return "/profile/update/username";
//       }
//     }
//   }
// };
