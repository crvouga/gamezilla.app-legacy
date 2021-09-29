import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import type { IFirebaseApp } from "../firebase-app";

export type IAuthMethod = "google";

export type IAuthUser = {
  displayName?: string;
  userId: string;
  avatarUrl?: string;
};

export type IAuthState =
  | {
      status: "loading";
    }
  | {
      status: "authenticated";
      authUser: IAuthUser;
    }
  | {
      status: "unauthenticated";
    };

export type IAuthDataAccess = {
  authenticate: ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => Promise<Error[]>;
  unauthenticate: () => Promise<void>;
  onAuthStateChanged: (set: (authState: IAuthState) => void) => () => void;
};

export const AuthDataAccessNoop = (): IAuthDataAccess => {
  return {
    async authenticate() {
      return [];
    },
    async unauthenticate() {},
    onAuthStateChanged() {
      return () => {};
    },
  };
};

export const AuthDataAccess = ({
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
