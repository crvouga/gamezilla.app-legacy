import { definitions, supabaseClient } from "../../infrastructure/supabase";
import { IDataAccess } from "./sign-out-logic";

export const dataAccess: IDataAccess = {
  signOut: async () => {
    await supabaseClient.auth.signOut();
  },
};
