import { FirebaseApp } from "./firebase-app";
import { AuthDataAccessFirebase } from "./auth-data-access.firebase";

export const DataAccess = () => {
  const firebaseApp = FirebaseApp();

  const authDataAccess = AuthDataAccessFirebase({
    firebaseApp,
  });

  return {
    auth: authDataAccess,
  };
};

export const dataAccess = DataAccess();
