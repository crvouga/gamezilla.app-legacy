import * as App from "./app-state";
import * as Auth from "../common/account/auth-state/auth-state-data-access";
import * as Profile from "../common/account/profile-state/profile-state-data-access";

export const dataAccess: App.IDataAccess = {
  profile: Profile.dataAccess,
  auth: Auth.dataAccess,
};
