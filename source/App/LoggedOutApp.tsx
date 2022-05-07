import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Page from "../Page";
import * as Routes from "../Routes";

/* 



Model



*/

export type Model = { type: "Login"; child: Page.Login.Model };

export const init = (): [Model, cmd.Cmd<Msg>] => {
  return [
    { type: "Login", child: Page.Login.init() },
    Routes.replace({ type: "Login" }),
  ];
};

const mapPageLogin = ([childModel, childCmd]: [
  Page.Login.Model,
  cmd.Cmd<Page.Login.Msg>
]): [Model, cmd.Cmd<Msg>] => {
  return [
    { type: "Login", child: childModel },
    pipe(
      childCmd,
      cmd.map((msg) => ({ type: "LoginMsg", msg }))
    ),
  ];
};

/* 



Update



*/

export type Msg = { type: "LoginMsg"; msg: Page.Login.Msg };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "LoginMsg":
      return mapPageLogin(Page.Login.update(msg.msg, model.child));
  }
};

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Login":
      return pipe(
        Page.Login.view(model.child),
        react.map((msg) => ({ type: "LoginMsg", msg }))
      );
  }
};
