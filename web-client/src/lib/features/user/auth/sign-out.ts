import { supabaseClient } from "../../_supabase";

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  return [error];
};
