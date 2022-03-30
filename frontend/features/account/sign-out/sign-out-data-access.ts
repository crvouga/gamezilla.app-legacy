import { supabaseClient } from "../../../data-access";
import { IDataAccess } from "./sign-out-logic";

export const dataAccess: IDataAccess = {
  signOut: async () => {
    await supabaseClient.auth.signOut();
  },
};
