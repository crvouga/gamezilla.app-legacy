import * as React from "react";
import * as ProfileMissingApp from "./ProfileMissingApp";
import * as ProfileFoundApp from "./ProfileMissingApp";
import * as Auth from "../Auth";
import { cmd, react } from "../Framework";
import * as View from "../View";

/* 


Model


*/

export type Model =
  | { type: "Loading" }
  | { type: "ProfileMissing"; child: ProfileMissingApp.Model }
  | { type: "ProfileFound"; child: ProfileFoundApp.Model };

export const init = (): [Model, cmd.Cmd<Msg>] => {
  return [{ type: "Loading" }, cmd.none];
};

/* 
  
  
Update  
  
  
*/

export type Msg = { type: "Noop" };

/* 



View



*/

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Loading":
      return () => <View.LoadingPage />;

    case "ProfileFound":
      return () => <View.LoadingPage />;

    case "ProfileMissing":
      return () => <View.LoadingPage />;
  }
};
