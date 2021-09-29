import { readable } from "svelte/store";
import { dataAccess } from "./data-access";
import type { IAuthState } from "./data-access/auth-data-access.interface";

export const authStateStore = readable<IAuthState>(
  { status: "loading" },
  dataAccess.auth.onAuthStateChanged
);
