import type { IToast } from "$lib/components/toaster";
import { Toaster } from "$lib/components/toaster";
import { writable } from "svelte/store";

export const toasterStore = writable<IToast[]>([]);

export const { enqueueToast, dequeueToast } = Toaster({
  setState: toasterStore.update,
  defaultDuration: 3000,
});
