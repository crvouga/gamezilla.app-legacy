import { FirebaseApp } from "./firebase-app";
import { AuthDataAccessFirebase } from "./auth-data-access.firebase";
import { getEnvironment } from "../environment";

export const DataAccess = () => {
  const firebaseApp = FirebaseApp();

  const authDataAccess = AuthDataAccessFirebase({
    firebaseApp,
    emulate: getEnvironment() === "development",
  });

  return {
    auth: authDataAccess,
  };
};
