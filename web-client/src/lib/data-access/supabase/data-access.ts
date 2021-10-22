import { environment } from "$lib/environment";
import { createClient } from "@supabase/supabase-js";
import { AuthDataAccess } from "./auth";
import { ProfileDataAccess } from "./profile";

export const DataAccessSupabase = () => {
  const supabaseClient = createClient(
    environment.supabaseUrl,
    environment.supbaseKey,
  );

  return {
    auth: AuthDataAccess({
      supabaseClient,
    }),
    profiile: ProfileDataAccess({
      supabaseClient,
    }),
  };
};
