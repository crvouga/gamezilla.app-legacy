import { onAuthState, signIn, signOut } from "./supabase-auth";
import {
  findElseCreateProfile,
  onProfile,
  updateProfile,
} from "./supabase-profile";

export const supabaseServices = {
  signIn,
  signOut,
  onAuthState,
  updateProfile,
  onProfile,
  findElseCreateProfile,
};
