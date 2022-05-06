import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "../Framework";
import * as Page from "../Page";

/* 


Model


*/

export type Model = { type: "Login"; model: Page.Login.Model };

export const init = (): Model => {
  return { type: "Login", model: Page.Login.init };
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
