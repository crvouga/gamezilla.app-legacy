import { ISagaParameters } from "../core";
import { signIn, signOut, onAuthState } from "./supabase-auth";
import {
  getElseCreateProfile,
  updateProfile,
  onProfile,
} from "./supabase-profile";

export const sagaParameters: ISagaParameters = {
  signIn,
  signOut,
  onAuthState,
  updateProfile,
  onProfile,
  getElseCreateProfile,
};
