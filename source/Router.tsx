import * as Page from "./Page";
import * as Navigation from "elm-ts/lib/Navigation";
import { cmd, react } from "elm-ts";
import { pipe } from "fp-ts/lib/function";

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
    };

const toInit = (type: Model["type"]): Model => {
  switch (type) {
    case "Home":
      return { type: "Home", page: Page.Home.init };

    case "Account":
      return { type: "Account", page: Page.Account.init };
  }
};

export const init = (pathname: string): Model => {
  return toInit(toRouteType(pathname));
};

const toRouteType = (routeString: string): Model["type"] => {
  switch (routeString) {
    case "Home":
      return "Home";

    case "Account":
      return "Account";

    default:
      return "Home";
  }
};

export const push = <Msg,>(route: Model["type"]) => {
  return Navigation.push<Msg>(route);
};

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    type: "RouteChanged",
    routeType: toRouteType(location),
  };
};

/* 


Update


*/

export type Msg =
  | { type: "RouteChanged"; routeType: Model["type"] }
  | { type: "GotAccountMsg"; msg: Page.Account.Msg }
  | { type: "GotHomeMsg"; msg: Page.Home.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "RouteChanged":
      return [toInit(msg.routeType), cmd.none];

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
  }
};

/*


View



*/

export const view = (
  profile: { avatarUrl: string; username: string },
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
  }
};
