import type { IDataAccess } from "../data-access.interface";
import { AuthDataAccessFirebase } from "./auth-data-access.firebase";
import { FirebaseApp } from "./firebase-app";
import { LobbyDataAccessFirebase } from "./lobby-data-access.firebase";

export const DataAccessFirebase = (): IDataAccess => {
  const { firebaseAuth, firestore } = FirebaseApp({ doesEmulate: false });

  return {
    auth: AuthDataAccessFirebase({
      firebaseAuth,
    }),

    lobby: LobbyDataAccessFirebase({ firestore }),
  };
};
