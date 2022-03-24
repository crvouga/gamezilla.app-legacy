import { IDataAccess } from "./auth-logic";
import * as SignIn from "./sign-in/sign-in-data-access";
import * as SignOut from "./sign-out/sign-out-data-access";
import * as Subscribe from "./subscribe/subscribe-data-access";

export const dataAccess: IDataAccess = {
  signIn: SignIn.dataAccess,
  signOut: SignOut.dataAccess,
  subscribe: Subscribe.dataAccess,
};
