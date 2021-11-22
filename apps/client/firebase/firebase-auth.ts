import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as signOutFirebase,
} from "firebase/auth";
import { IOnAuthState, ISignIn, ISignInMethod, ISignOut } from "../core/auth";
import { firebaseApp } from "./firebase";

export const firebaseAuth = getAuth(firebaseApp);

export const signOut: ISignOut = () => {
  signOutFirebase(firebaseAuth);
};

export const signIn: ISignIn = async (method: ISignInMethod) => {
  switch (method.type) {
    case "google":
      const provider = new GoogleAuthProvider();

      await signInWithRedirect(firebaseAuth, provider);

      return;
  }
};

export const onAuthState: IOnAuthState = (set) => {
  set({
    type: "loading",
  });

  return onAuthStateChanged(firebaseAuth, (authState) => {
    if (authState) {
      set({
        type: "signed-in",
        userId: authState.uid,
      });
      return;
    }

    set({
      type: "signed-out",
    });
  });
};
