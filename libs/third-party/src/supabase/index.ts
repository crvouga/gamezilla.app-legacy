import { IClientDependencies } from "@gamezilla/core";
import { onAuthState, signIn, signOut } from "./supabase-auth";
import {
  getElseCreateProfile,
  onProfile,
  updateProfile,
} from "./supabase-profile";

export const clientDependencies: IClientDependencies = {
  signIn,
  signOut,
  onAuthState,
  updateProfile,
  onProfile,
  getElseCreateProfile,
};
