import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Page from "../Page";
import * as Routes from "./Routes";

/* 


Model


*/

export type Model = { type: "Login"; model: Page.Login.Model };

export const init = (route: Routes.Route): [Model, cmd.Cmd<Msg>] => {
  switch (route.type) {
    case "Login":
      return [{ type: "Login", model: Page.Login.init }, cmd.none];

    default:
      return [
        { type: "Login", model: Page.Login.init },
        Routes.replace({ type: "Login" }),
      ];
  }
};

/* 


Update


*/

export type Msg = Page.Login.Msg;

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "Login":
      switch (msg.group) {
        case "Login":
          const [pageModel, pageCmd] = Page.Login.update(msg, model.model);

          return [{ ...model, model: pageModel }, pageCmd];
      }
  }
};

/* 


View


*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Login":
      return Page.Login.view(model.model);
  }
};
