import { supabaseClient } from "../../isomorphic/supabase";

export const logout = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  supabaseClient.auth.signOut();
};
