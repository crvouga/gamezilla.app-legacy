import { flow, pipe } from "fp-ts/lib/function";
import { cmd, react } from "./Framework";
import * as Navigation from "./Framework/Navigation";
import * as Page from "./Page";
import * as Profile from "./Profile";

/* 



Model



*/

export type Model =
  | {
      type: "Account";
      page: Page.Account.Model;
    }
  | {
      type: "Home";
      page: Page.Home.Model;
    }
  | {
      type: "Logout";
      page: Page.Logout.Model;
    }
  | {
      type: "ProfileDelete";
      page: Page.ProfileDelete.Model;
    }
  | {
      type: "ProfileUpdate";
      page: Page.ProfileUpdate.Model;
    }
  | {
      type: "ProfileUpdateName";
      page: Page.ProfileUpdateName.Model;
    }
  | {
      type: "ProfileUpdateUsername";
      page: Page.ProfileUpdateUsername.Model;
    };

export const routeToInit = (
  profile: Profile.Profile,
  type: Model["type"]
): Model => {
  switch (type) {
    case "Home":
      return { type: "Home", page: Page.Home.init };

    case "Account":
      return { type: "Account", page: Page.Account.init };

    case "Logout":
      return { type: "Logout", page: Page.Logout.init };

    case "ProfileDelete":
      return { type: "ProfileDelete", page: Page.ProfileDelete.init };

    case "ProfileUpdate":
      return {
        type: "ProfileUpdate",
        page: Page.ProfileUpdate.init(profile),
      };

    case "ProfileUpdateName":
      return {
        type: "ProfileUpdateName",
        page: Page.ProfileUpdateName.init(profile),
      };

    case "ProfileUpdateUsername":
      return {
        type: "ProfileUpdateUsername",
        page: Page.ProfileUpdateUsername.init(profile),
      };
  }
};

export const locationToPathname = (location: Navigation.Location) =>
  location.pathname.substring(1);

export const pathnameToRoute = (pathname: string): Model["type"] => {
  switch (pathname) {
    case "Home":
      return "Home";

    case "Account":
      return "Account";

    case "Logout":
      return "Logout";

    case "ProfileDelete":
      return "ProfileDelete";

    case "ProfileUpdate":
      return "ProfileUpdate";

    case "ProfileUpdateName":
      return "ProfileUpdateName";

    case "ProfileUpdateUsername":
      return "ProfileUpdateUsername";

    default:
      return "Home";
  }
};

export const locationToRoute = flow(locationToPathname, pathnameToRoute);

export const init = (
  profile: Profile.Profile,
  location: Navigation.Location
): Model => {
  return routeToInit(profile, pathnameToRoute(locationToPathname(location)));
};

export const push = <Msg,>(route: Model["type"]) => {
  return Navigation.push<Msg>(route);
};

export const replace = <Msg,>(route: Model["type"]) => {
  return Navigation.replace<Msg>(route);
};

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "RouteChanged",
    routeType: locationToRoute(location),
  };
};

/* 


Update


*/

export type Msg =
  | { type: "RouteChanged"; routeType: Model["type"] }
  | { type: "GotAccountMsg"; msg: Page.Account.Msg }
  | { type: "GotHomeMsg"; msg: Page.Home.Msg }
  | { type: "GotLogoutMsg"; msg: Page.Logout.Msg }
  | { type: "GotProfileDeleteMsg"; msg: Page.ProfileDelete.Msg }
  | { type: "GotProfileUpdateMsg"; msg: Page.ProfileUpdate.Msg }
  | { type: "GotProfileUpdateNameMsg"; msg: Page.ProfileUpdateName.Msg }
  | {
      type: "GotProfileUpdateUsernameMsg";
      msg: Page.ProfileUpdateUsername.Msg;
    };

export const update =
  (profile: Profile.Profile) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "RouteChanged":
        return [routeToInit(profile, msg.routeType), cmd.none];

      case "GotAccountMsg":
        if (model.type === "Account") {
          const [pageModel, pageCmd] = Page.Account.update(msg.msg, model.page);
          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotAccountMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotHomeMsg":
        if (model.type === "Home") {
          const [pageModel, pageCmd] = Page.Home.update(msg.msg, model.page);
          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotHomeMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotLogoutMsg":
        if (model.type === "Logout") {
          const [pageModel, pageCmd] = Page.Logout.update(msg.msg, model.page);
          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotLogoutMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotProfileDeleteMsg":
        if (model.type === "ProfileDelete") {
          const [pageModel, pageCmd] = Page.ProfileDelete.update(profile)(
            msg.msg,
            model.page
          );

          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotProfileDeleteMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotProfileUpdateMsg":
        if (model.type === "ProfileUpdate") {
          const [pageModel, pageCmd] = Page.ProfileUpdate.update(profile)(
            msg.msg,
            model.page
          );

          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotProfileUpdateMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotProfileUpdateNameMsg":
        if (model.type === "ProfileUpdateName") {
          const [pageModel, pageCmd] = Page.ProfileUpdateName.update(profile)(
            msg.msg,
            model.page
          );

          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotProfileUpdateNameMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];

      case "GotProfileUpdateUsernameMsg":
        if (model.type === "ProfileUpdateUsername") {
          const [pageModel, pageCmd] = Page.ProfileUpdateUsername.update(
            profile
          )(msg.msg, model.page);

          return [
            { ...model, page: pageModel },
            pipe(
              pageCmd,
              cmd.map((msg) => ({ type: "GotProfileUpdateUsernameMsg", msg }))
            ),
          ];
        }

        return [model, cmd.none];
    }
  };

/*


View



*/

export const view = (
  profile: { name: string; avatarUrl: string; username: string },
  model: Model
): react.Html<Msg> => {
  switch (model.type) {
    case "Account":
      return pipe(
        Page.Account.view(profile, model.page),
        react.map((msg) => ({ type: "GotAccountMsg", msg }))
      );

    case "Home":
      return pipe(
        Page.Home.view(profile, model.page),
        react.map((msg) => ({ type: "GotHomeMsg", msg }))
      );

    case "Logout":
      return pipe(
        Page.Logout.view(model.page),
        react.map((msg) => ({ type: "GotLogoutMsg", msg }))
      );

    case "ProfileDelete":
      return pipe(
        Page.ProfileDelete.view(model.page),
        react.map((msg) => ({ type: "GotProfileDeleteMsg", msg }))
      );

    case "ProfileUpdate":
      return pipe(
        Page.ProfileUpdate.view(profile, model.page),
        react.map((msg) => ({ type: "GotProfileUpdateMsg", msg }))
      );

    case "ProfileUpdateName":
      return pipe(
        Page.ProfileUpdateName.view(model.page),
        react.map((msg) => ({ type: "GotProfileUpdateNameMsg", msg }))
      );

    case "ProfileUpdateUsername":
      return pipe(
        Page.ProfileUpdateUsername.view(model.page),
        react.map((msg) => ({ type: "GotProfileUpdateUsernameMsg", msg }))
      );
  }
};
