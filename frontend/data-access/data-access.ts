import * as App from "../app/app-state";
import * as Auth from "../features/account/auth-state/auth-state-data-access";
import * as Profile from "../features/account/profile-state/profile-state-data-access";

export const dataAccess: App.IDataAccess = {
  profile: Profile.dataAccess,
  auth: Auth.dataAccess,
};
