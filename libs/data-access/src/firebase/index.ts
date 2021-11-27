import { signIn, signOut, onAuthState } from "./firebase-auth";

export const firebaseServices = {
  onAuthState,
  signIn,
  signOut,
};
