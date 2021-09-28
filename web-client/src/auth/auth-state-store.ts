import { readable } from "svelte/store";
import { authDataAccess, IAuthState } from "./auth-data-access";

export const authStateStore = readable<IAuthState>(
  {
    status: "loading",
  },
  (set) => {
    authDataAccess.onAuthStateChanged((authState) => {
      set(authState);
    });
  }
);
