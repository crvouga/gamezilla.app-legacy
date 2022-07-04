import * as EmailAddress from "EmailAddress";
import { Browser, Option, pipe } from "Core";

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
  | {
      type: "LoginEmailPassword";
      userId: string;
      emailAddress: EmailAddress.EmailAddress;
    }
  | { type: "LoginEmailCreateAccount"; emailAddress: EmailAddress.EmailAddress }
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
  LoginEmailCreateAccount: "LoginEmailCreateAccount",
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

const isRouteType = (routeType: unknown): routeType is Route["type"] => {
  return typeof routeType === "string" && routeType in routesTypes;
};

const emailAddressQueryKey = "emailAddress";

const decodeEmailAddressQuery = (
  location: Browser.Location,
): Option.Option<EmailAddress.EmailAddress> => {
  const value = location.query[emailAddressQueryKey];

  if (!value) {
    return Option.None;
  }

  const decoded = EmailAddress.decode(value);

  return Option.fromResult(decoded);
};

const userIdQueryKey = "userId";

const decodeUserIdQuery = (
  location: Browser.Location,
): Option.Option<string> => {
  return Option.fromNullable(location.query[userIdQueryKey]);
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

    case "LoginEmailPassword": {
      const userId = decodeUserIdQuery(location);
      const emailAddress = decodeEmailAddressQuery(location);

      if (userId.type === "Some" && emailAddress.type === "Some") {
        return Option.Some({
          type: first,
          emailAddress: emailAddress.value,
          userId: userId.value,
        });
      }

      return Option.None;
    }

    case "LoginEmailCreateAccount": {
      return pipe(
        location,
        decodeEmailAddressQuery,
        Option.map((emailAddress) => ({ type: first, emailAddress })),
      );
    }

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

    case "LoginEmailCreateAccount":
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
