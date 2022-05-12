import * as Page from "../Page";
import { option } from "fp-ts";
import * as Session from "../Session";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import { pipe } from "fp-ts/lib/function";
import { exhaustive } from "../Utility";

//
//
//
//
// Model
//
//
//
//

type Dependencies = {
  session: Session.Session;
  location: { pathname: string };
};

export type Model = { type: "ProfileCreate"; child: Page.ProfileCreate.Model };

export const init = ({
  session,
  location,
}: Dependencies): [Model, cmd.Cmd<Msg>] => {
  const route = Routes.decode(location);

  const fallback: [Model, cmd.Cmd<Msg>] = [
    { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
    Routes.replace({ type: "ProfileCreate" }),
  ];

  if (option.isNone(route)) {
    return fallback;
  }

  const routeType = route.value.type;
  switch (routeType) {
    case "ProfileCreate":
      return [
        { type: "ProfileCreate", child: Page.ProfileCreate.init(session) },
        cmd.none,
      ];

    case "Account":
    case "Chess":
    case "ConnectFour":
    case "Home":
    case "Login":
    case "Logout":
    case "ProfileDelete":
    case "TicTacToe":
    case "ProfileUpdateUsername":
    case "ProfileUpdateAvatar":
    case "ProfileUpdateAvatarStyle":
    case "ProfileUpdateName":
    case "ProfileUpdate":
      return fallback;

    default:
      return exhaustive(routeType);
  }
};

/* 



Update



*/

export type Msg = { type: "ProfileCreateMsg"; msg: Page.ProfileCreate.Msg };

export const update = (
  { session }: Dependencies,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
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
