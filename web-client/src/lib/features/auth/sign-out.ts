import { supabaseClient } from "$lib/supabase";

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  return [error];
};
