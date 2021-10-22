import type { IAuthState } from "$lib/data-access/auth-data-access.interface";
import { readable } from "svelte/store";
import { dataAccess } from "..";

export const AuthStore = () => {
  const store = readable<IAuthState>(
    {
      status: "unauthenticated",
    },
    dataAccess.auth.onAuthStateChanged
  );

  return store;
};
