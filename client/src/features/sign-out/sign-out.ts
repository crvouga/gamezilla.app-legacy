import { supabaseClient } from "../../lib/supabase-client";

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    return {
      errors: [new Error(error.message)],
    };
  }

  return {
    errors: [],
  };
};
