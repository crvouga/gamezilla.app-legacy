import * as Auth from "../Auth";
import { cmd, react } from "../Framework";
import * as Page from "../Page";

/* 


Model


*/

export type Model = { type: "ProfileCreate"; model: Page.ProfileCreate.Model };

export const init = (session: Auth.Session): Model => {
  return {
    type: "ProfileCreate",
    model: Page.ProfileCreate.init(session),
  };
};

/* 


Update


*/

export type Msg = Page.ProfileCreate.Msg;

export const update = (
  session: Auth.Session,
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (model.type) {
    case "ProfileCreate":
      switch (msg.group) {
        case "ProfileCreate":
          const [pageModel, pageCmd] = Page.ProfileCreate.update(
            session,
            msg,
            model.model
          );

          return [{ ...model, model: pageModel }, pageCmd];
      }
  }
};

/*


View


*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "ProfileCreate":
      return Page.ProfileCreate.view(model.model);
  }
};
