import * as EmailAddress from "EmailAddress";
import { Browser, Option } from "Core";

//
//
//
// Model
//
//
//

export type Route =
  | { type: "Account" }
  | { type: "Home" }
  | { type: "Login" }
  | { type: "LoginEmail" }
  | { type: "LoginEmailPassword"; emailAddress: EmailAddress.EmailAddress }
  | { type: "Logout" }
  | { type: "ProfileCreate" }
  | { type: "ProfileDelete" }
  | { type: "ProfileUpdate" }
  | { type: "ProfileUpdateAvatar" }
  | { type: "ProfileUpdateName" }
  | { type: "ProfileUpdateUsername" }
  | { type: "ProfileUpdateTheme" }
  | { type: "Game" }
  | { type: "Chat" }
  | { type: "ChatNew" }
  | { type: "ChatConversation"; conversationId: string };

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Route["type"]]: string } = {
  Account: "Account",
  Home: "Home",
  Login: "Login",
  LoginEmail: "LoginEmail",
  LoginEmailPassword: "LoginEmailPassword",
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
  ChatConversation: "ChatConversation",
};

const emailAddressQueryKey = "emailAddress";

const isRouteType = (routeType: unknown): routeType is Route["type"] => {
  return typeof routeType === "string" && routeType in routesTypes;
};

export const decode = (location: Browser.Location): Option.Option<Route> => {
  const [first, second] = location.pathname.substring(1).split("/");

  if (!isRouteType(first)) {
    return Option.None;
  }

  switch (first) {
    case "ChatConversation": {
      if (typeof second !== "string") {
        return Option.None;
      }
      return Option.Some({
        type: "ChatConversation",
        conversationId: second,
      });
    }

    case "LoginEmailPassword":
      const value = location.query[emailAddressQueryKey];

      console.log(value);
      if (!value) {
        return Option.None;
      }

      const decoded = EmailAddress.decode(value);

      console.log(decoded);

      if (decoded.type === "Err") {
        return Option.None;
      }

      return Option.Some({ type: first, emailAddress: decoded.value });

    default: {
      return Option.Some({ type: first });
    }
  }
};

export const encode = (route: Route): string => {
  switch (route.type) {
    case "ChatConversation":
      return `/${route.type}/${route.conversationId}`;

    case "LoginEmailPassword":
      return `/${route.type}?${emailAddressQueryKey}=${route.emailAddress}`;

    default:
      return `/${route.type}`;
  }
};

//
//
//
// Cmds
//
//
//

export const push = (route: Route) => {
  return Browser.push(encode(route));
};

export const back = Browser.back;

export const replace = (route: Route) => {
  return Browser.replace(encode(route));
};

//
//
//
// Msg
//
//
//

export const GotRoute = (route: Route) => {
  return {
    group: "Route",
    type: "GotRoute",
    route,
  } as const;
};

export type GotRoute = ReturnType<typeof GotRoute>;

export type Msg = GotRoute;
