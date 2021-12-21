import { supabaseClient } from "src/supabase";

type ISignOut = () => Promise<{ errors: Error[] }>;

export const signOut: ISignOut = async () => {
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
