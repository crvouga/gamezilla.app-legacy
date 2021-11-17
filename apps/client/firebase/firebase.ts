import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
