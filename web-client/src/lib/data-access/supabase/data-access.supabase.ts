import { createClient } from "@supabase/supabase-js";
import type { IDataAccess } from "../data-access.interface";
import { AuthDataAccessSupabase } from "./auth-data-access.supabase";
import { LobbyDataAccessSupabase } from "./lobby-data-access.supabase";
import { environment } from "$lib/environment";

export const DataAccessSupabase = (): IDataAccess => {
  const supabaseClient = createClient(
    environment.supabaseUrl,
    environment.supbaseKey
  );

  return {
    auth: AuthDataAccessSupabase({
      supabaseClient,
    }),

    lobby: LobbyDataAccessSupabase(),
  };
};
