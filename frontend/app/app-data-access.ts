import * as Auth from "../features/auth/auth-data-access";
import * as Profile from "../features/profile/profile-data-access";
import { IDataAccess } from "./app-logic";

export const dataAccess: IDataAccess = {
  auth: Auth.dataAccess,
  profile: Profile.dataAccess,
};
