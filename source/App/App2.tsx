import * as React from "react";
import { cmd, react, sub } from "../Framework";
import * as Navigation from "../Framework/Navigation";
import * as Profile from "../Profile";
import * as Session from "../Session";
import * as View from "../View";
import * as Page from "../Page";

//
//
//
// Model
//
//
//

export type Model = {
  session: Session.Model;
  profile: Profile.Model;
  page:
    | { type: "Login"; child: Page.Login.Model }
    | { type: "Home"; child: Page.Home.Model };
};

export const init = (_: Navigation.Location): [Model, cmd.Cmd<Msg>] => {
  const [session, sessionCmd] = Session.init();
  return [
    {
      session,
      profile: Profile.init,
      page: { type: "Login", child: Page.Login.init() },
    },
    sessionCmd,
  ];
};

type Location = { pathname: string };

//
//
//
// Location
//
//
//

export const locationToMsg = (location: Navigation.Location): Msg => {
  return {
    group: "Location",
    type: "LocationChanged",
    location: { pathname: location.pathname },
  };
};

//
//
//
//
// Update
//
//
//
//

export type Msg = Session.Msg | Profile.Msg | Page.Msg;

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Profile":
      const [profile, profileCmd] = Profile.update(msg, model.profile);
      return [{ ...model, profile }, profileCmd];

    case "Session":
      const session = Session.update(msg);
      return [{ ...model, session }, cmd.none];

    case "Location":
    case "Home":
    case "Login":
      const [page, pageCmd] = Page.update(msg, model.page);
      return [{ ...model, page }, pageCmd];
  }
};

//
//
//
//
// View
//
//
//
//

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) => {
    return <View.ThemeProvider>{viewMain(model)(dispatch)}</View.ThemeProvider>;
  };

const viewMain = (model: Model): react.Html<Msg> => {
  switch (model.session.type) {
    case "Found":
      switch (model.profile.type) {
        case "Found":
          switch (model.page.type) {
            case "Login":
              return () => <>page not found</>;

            case "Home":
              return Page.Home.view(model.profile.profile, model.page.child);
          }

        case "Loading":
          return () => <>loading profile</>;

        case "Missing":
          return () => <>profile missing</>;
      }

    case "NotFound":
      switch (model.page.type) {
        case "Login":
          return Page.Login.view(model.page.child);

        case "Home":
          return () => <>not found</>;
      }

    case "Loading":
      return () => <View.LoadingPage />;
  }
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = (model: Model): sub.Sub<Msg> => {
  switch (model.session.type) {
    case "Found":
      return sub.batch<Msg>([
        Profile.subscriptions(model.session.session, model.profile),
        Session.subscriptions(),
      ]);

    case "Loading":
      return Session.subscriptions();

    case "NotFound":
      return Session.subscriptions();
  }
};
