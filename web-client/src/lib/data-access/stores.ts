import { readable } from "svelte/store";
import type { IAuthState } from "./auth-data-access.interface";
import type { IDataAccess } from "./data-access";

export const Stores = (dataAccess: IDataAccess) => {
  const auth = readable<IAuthState>(
    {
      status: "loading",
    },
    dataAccess.auth.onAuthStateChanged
  );

  return {
    auth,
  };
};
