import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Page from "../Page";

/* 



Model



*/

export type Model = Page.Login.Model;

export const init = (): [Model, cmd.Cmd<Msg>] => {
  return mapPageLogin(Page.Login.init());
};

const mapPageLogin = ([subModel, subCmd]: [
  Page.Login.Model,
  cmd.Cmd<Page.Login.Msg>
]): [Model, cmd.Cmd<Msg>] => {
  return [
    subModel,
    pipe(
      subCmd,
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
      return mapPageLogin(Page.Login.update(msg.msg, model));
  }
};

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
  return pipe(
    Page.Login.view(model),
    react.map((msg) => ({ type: "LoginMsg", msg }))
  );
};
