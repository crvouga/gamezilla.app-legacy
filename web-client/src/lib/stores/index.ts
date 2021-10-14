import { dataAccess } from "$lib/data-access";
import type { IAuthState } from "$lib/data-access/auth-data-access.interface";
import { readable } from "svelte/store";
import { ToastStore } from "./toast";

const authStore = readable<IAuthState>(
  {
    status: "loading",
  },
  dataAccess.auth.onAuthStateChanged
);

export const stores = {
  auth: authStore,
  toast: ToastStore(),
};
