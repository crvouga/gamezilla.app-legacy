import * as Page from "../Page";
import { option } from "fp-ts";
import * as Auth from "../Auth";
import { cmd, react } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import { pipe } from "fp-ts/lib/function";

/* 


Model


*/

export type Model = { type: "ProfileCreate"; child: Page.ProfileCreate.Model };

const routes: { [routeType in Model["type"]]: string } = {
  ProfileCreate: "ProfileCreate",
};

const isRoute = (route: string): route is Model["type"] => {
  return route in routes;
};

export const decode = (location: { pathname: string }) => {
  const url = location.pathname.substring(1);

  if (isRoute(url)) {
    return option.some(url);
  }

  return option.none;
};

const encode = (modelType: Model["type"]): string => {
  return modelType;
};

type init = (
  location: { pathname: string },
  session: Auth.Session
) => [Model, cmd.Cmd<Msg>];

export const init: init = (location, session) => {
  const route = decode(location);

  if (option.isNone(route)) {
    return [
      { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
      Navigation.replace(encode("ProfileCreate")),
    ];
  }

  switch (route.value) {
    case "ProfileCreate":
      return [
        { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
        cmd.none,
      ];
  }
};

/* 



Update



*/

export type Msg = { type: "ProfileCreateMsg"; msg: Page.ProfileCreate.Msg };

type update = (
  session: Auth.Session,
  msg: Msg,
  model: Model
) => [Model, cmd.Cmd<Msg>];

export const update: update = (session, msg, model) => {
  switch (msg.type) {
    case "ProfileCreateMsg":
      if (model.type === "ProfileCreate") {
        const [childModel, childCmd] = Page.ProfileCreate.update(
          session,
          msg.msg,
          model.child
        );
        return [
          { ...model, child: childModel },
          pipe(
            childCmd,
            cmd.map((msg) => ({ type: "ProfileCreateMsg", msg }))
          ),
        ];
      }
      return [model, cmd.none];
  }
};

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "ProfileCreate":
      return pipe(
        Page.ProfileCreate.view(model.child),
        react.map((msg) => ({ type: "ProfileCreateMsg", msg }))
      );
  }
};
