import type { IAuthState, IProfile } from "$lib/data-access";
import { derived, readable } from "svelte/store";
import { dataAccess } from "../data-access";
import { ToastStore } from "./toast";

export const auth = readable<IAuthState>(
  {
    status: "unauthenticated",
  },
  dataAccess.auth.onAuthStateChanged,
);

export const profile = derived<[typeof auth], IProfile | null>(
  [auth],
  ([authState], set) => {
    if (authState.status === "authenticated") {
      return dataAccess.profiile.onProfile(
        {
          userId: authState.authUser.userId,
        },
        set,
      );
    }

    set(null);
    return;
  },
);

export const toast = ToastStore();
