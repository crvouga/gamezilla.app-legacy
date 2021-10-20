import { DataAccessSupabase } from "./supabase/data-access.supabase";
import { Stores } from "./stores";

export const dataAccess = DataAccessSupabase();

export const stores = Stores();
