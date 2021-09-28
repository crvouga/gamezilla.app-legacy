import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { firebaseApp } from "../firebase-app";

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

export type IAuthenticate = ({
  authMethod,
}: {
  authMethod: IAuthMethod;
}) => Promise<Error[]>;

export type IUnauthenticate = () => Promise<void>;

export type IOnAuthStateChanged = (
  set: (authState: IAuthState) => void
) => () => void;

export type IAuthDataAccess = {
  authenticate: IAuthenticate;
  unauthenticate: IUnauthenticate;
  onAuthStateChanged: IOnAuthStateChanged;
};

const AuthDataAccess = ({
  firebaseApp,
}: {
  firebaseApp: Parameters<typeof getAuth>[0];
}): IAuthDataAccess => {
  const firebaseAuth = getAuth(firebaseApp);

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

export const authDataAccess = AuthDataAccess({ firebaseApp });
