import { AuthDataAccessSupabase } from "./auth-data-access.supabase";
import { LobbyDataAccessSupabase } from "./lobby-data-access.supabase";
import { SupabaseClient } from "./supabase-client";

export const DataAccess = () => {
  const supabaseClient = SupabaseClient();

  return {
    auth: AuthDataAccessSupabase({
      supabaseAuthClient: supabaseClient.auth,
    }),

    lobby: LobbyDataAccessSupabase(),
  };
};

export type IDataAccess = ReturnType<typeof DataAccess>;
