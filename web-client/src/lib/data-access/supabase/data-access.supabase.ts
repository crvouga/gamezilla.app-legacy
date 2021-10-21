import type { IDataAccess } from "../data-access.interface";
import { AuthDataAccessSupabase } from "./auth-data-access.supabase";
import { LobbyDataAccessSupabase } from "./lobby-data-access.supabase";
import { SupabaseClient } from "./supabase-client";

export const DataAccessSupabase = (): IDataAccess & {
  _supabaseClient: ReturnType<typeof SupabaseClient>;
} => {
  const supabaseClient = SupabaseClient();

  return {
    _supabaseClient: supabaseClient,

    auth: AuthDataAccessSupabase({
      supabaseAuthClient: supabaseClient.auth,
    }),

    lobby: LobbyDataAccessSupabase(),
  };
};
