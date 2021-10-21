import type { IDataAccess } from "../data-access.interface";
import { AuthDataAccessSupabase } from "./auth-data-access.supabase";
import { LobbyDataAccessSupabase } from "./lobby-data-access.supabase";
import { SupabaseClient } from "./supabase-client";

export const DataAccessSupabase = (): IDataAccess => {
  const supabaseClient = SupabaseClient();

  return {
    auth: AuthDataAccessSupabase({
      supabaseAuthClient: supabaseClient.auth,
    }),

    lobby: LobbyDataAccessSupabase(),
  };
};
