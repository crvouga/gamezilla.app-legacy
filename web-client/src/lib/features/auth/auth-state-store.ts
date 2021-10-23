import { readable } from "svelte/store";
import type { IAuthState } from "./on-auth-state";
import { onAuthState } from "./on-auth-state";

export const authStateStore = readable<IAuthState>(
  {
    status: "unauthenticated",
  },
  onAuthState
);
