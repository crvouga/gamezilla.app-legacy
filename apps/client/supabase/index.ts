import { IAppServices } from "../core";
import { signIn, signOut, onAuthState } from "./supabase-auth";
import { setProfile, onProfile } from "./supabase-profile";

export const supabaseServices: IAppServices = {
  signIn,
  signOut,
  onAuthState,
  setProfile,
  onProfile,
};
