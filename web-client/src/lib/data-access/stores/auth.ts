import type { IAuthState } from "$lib/data-access/auth-data-access.interface";
import { readable } from "svelte/store";
import { dataAccess } from "..";

export const AuthStore = () => {
  return readable<IAuthState>(
    {
      status: "loading",
    },
    dataAccess.auth.onAuthStateChanged,
  );
};
