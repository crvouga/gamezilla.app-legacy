import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import type { IFirebaseApp } from "./firebase-app";
import type { IAuthDataAccess } from "./auth-data-access.interface";

export const AuthDataAccessFirebase = ({
  firebaseApp,
  emulate,
}: {
  firebaseApp: IFirebaseApp;
  emulate?: boolean;
}): IAuthDataAccess => {
  const firebaseAuth = getAuth(firebaseApp);

  if (emulate) {
    connectAuthEmulator(firebaseAuth, "http://localhost:9099", {
      disableWarnings: true,
    });
  }

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
