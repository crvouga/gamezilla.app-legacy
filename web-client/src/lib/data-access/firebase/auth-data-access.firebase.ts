import { onAuthStateChanged, signOut } from "firebase/auth";
import type { IAuthDataAccess } from "../auth-data-access.interface";
import type { IFirebaseAuth } from "./firebase-app";

export const AuthDataAccessFirebase = ({
  firebaseAuth,
}: {
  firebaseAuth: IFirebaseAuth;
}): IAuthDataAccess => {
  return {
    async unauthenticate() {
      try {
        await signOut(firebaseAuth);
        return [];
      } catch (error) {
        return [new Error(String(error))];
      }
    },

    async authenticate(authMethod) {
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
