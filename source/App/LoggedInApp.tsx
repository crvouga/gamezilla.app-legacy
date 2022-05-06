import * as ProfileMissingApp from "./ProfileMissingApp";
import * as ProfileFoundApp from "./ProfileMissingApp";
import * as Auth from "../Auth";
import { cmd } from "../Framework";

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
