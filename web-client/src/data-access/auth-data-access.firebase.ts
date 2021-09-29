import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import type { IAuthDataAccess } from "./auth-data-access.interface";
import type { IFirebaseAuth } from "./firebase-app";

export const AuthDataAccessFirebase = ({
  firebaseAuth,
}: {
  firebaseAuth: IFirebaseAuth;
}): IAuthDataAccess => {
  return {
    async unauthenticate() {
      await signOut(firebaseAuth);
    },

    async authenticate({ authMethod }) {
      if (authMethod === "google") {
        try {
          await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
          return [];
        } catch (error) {
          return [error];
        }
      }

      return [
        new Error(`${authMethod} is an unsupported authentication method`),
      ];
    },

    onAuthStateChanged(set) {
      set({
        status: "loading",
      });

      const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          set({
            status: "authenticated",
            authUser: {
              userId: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              avatarUrl: firebaseUser.photoURL,
            },
          });
          return;
        }

        set({
          status: "unauthenticated",
        });
      });

      return () => {
        unsubscribe();
      };
    },
  };
};
