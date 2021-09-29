import { FirebaseApp } from "./firebase-app";
import { AuthDataAccessFirebase } from "./auth-data-access.firebase";
import { getEnvironment } from "../environment";
import { LobbyDataAccessFirebase } from "./lobby-data-access.firebase";

export const DataAccess = () => {
  const { firestore, firebaseAuth } = FirebaseApp({
    doesEmulate: getEnvironment() === "development",
  });

  return {
    auth: AuthDataAccessFirebase({
      firebaseAuth,
    }),
    lobby: LobbyDataAccessFirebase({
      firestore,
    }),
  };
};
