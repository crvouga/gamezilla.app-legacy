import * as Page from "../Page";
import { option } from "fp-ts";
import * as Auth from "../Auth";
import { cmd, react } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Routes from "../Routes";
import { pipe } from "fp-ts/lib/function";

/* 


Model


*/

export type Model = { type: "ProfileCreate"; child: Page.ProfileCreate.Model };

export const init = (
  location: { pathname: string },
  session: Auth.Session
): [Model, cmd.Cmd<Msg>] => {
  const route = Routes.decode(location);

  const fallback: [Model, cmd.Cmd<Msg>] = [
    { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
    Navigation.replace(Routes.encode({ type: "ProfileCreate" })),
  ];

  if (option.isNone(route)) {
    return fallback;
  }

  switch (route.value.type) {
    case "ProfileCreate":
      return [
        { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
        cmd.none,
      ];

    default:
      return fallback;
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
