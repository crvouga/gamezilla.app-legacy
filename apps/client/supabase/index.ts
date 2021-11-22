import { ISagaParameters } from "../core";
import { signIn, signOut, onAuthState } from "./supabase-auth";
import {getElseCreateProfile, setProfile, onProfile } from "./supabase-profile";

export const supabaseServices: ISagaParameters = {
  signIn,
  signOut,
  onAuthState,
  setProfile,
  onProfile,
  getElseCreateProfile
};
