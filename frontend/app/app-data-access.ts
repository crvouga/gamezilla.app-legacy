import { IDataAccess } from "./app-logic";
import * as Auth from "../features/auth/auth-data-access";
import * as Profile from "../features/profile/profile-data-access";
import * as SignIn from "../features/auth/sign-in/sign-in-data-access";
import * as SignOut from "../features/auth/sign-out/sign-out-data-access";

export const dataAccess: IDataAccess = {
  auth: Auth.dataAccess,
  signIn: SignIn.dataAccess,
  signOut: SignOut.dataAccess,
  profile: Profile.dataAccess,
};
