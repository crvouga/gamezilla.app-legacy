import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdO_pbFEFwdkWqcRIFABFD_OXNRlXMzis",
  authDomain: "gamezilla.firebaseapp.com",
  databaseURL: "https://gamezilla-default-rtdb.firebaseio.com",
  projectId: "gamezilla",
  storageBucket: "gamezilla.appspot.com",
  messagingSenderId: "58925712607",
  appId: "1:58925712607:web:66f1037547a45bf69a556a",
  measurementId: "G-P243F70BSW",
};

export const FirebaseApp = ({ doesEmulate }: { doesEmulate: boolean }) => {
  const firebaseApp = initializeApp(firebaseConfig);
  const firebaseAuth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (doesEmulate) {
    connectAuthEmulator(firebaseAuth, "http://localhost:9099", {
      disableWarnings: true,
    });

    connectFirestoreEmulator(firestore, "localhost", 8080);
  }

  return {
    firebaseApp,
    firestore,
    firebaseAuth,
  };
};

export type IFirebaseApp = ReturnType<typeof FirebaseApp>["firebaseApp"];
export type IFirebaseAuth = ReturnType<typeof FirebaseApp>["firebaseAuth"];
export type IFirestore = ReturnType<typeof FirebaseApp>["firestore"];
