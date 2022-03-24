import { supabaseClient } from "../../../data-access";
import { IDataAccess } from "./sign-in-logic";

export const dataAccess: IDataAccess = {
  signIn: async (method) => {
    await supabaseClient.auth.signIn({ provider: method.type });
  },
};
