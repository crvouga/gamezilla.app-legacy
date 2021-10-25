import type { IToast } from "$lib/components/toaster";
import { Toaster } from "$lib/components/toaster";
import type { IAuthState, IProfile } from "$lib/features";
import { onAuthState, onProfile } from "$lib/features";
import type { Readable } from "svelte/store";
import { derived, readable, writable } from "svelte/store";

export const authStateStore = readable<IAuthState>(
  {
    status: "unauthenticated",
  },
  onAuthState
);

export const authUserProfileStore: Readable<IProfile | null> = derived<
  [typeof authStateStore],
  IProfile | null
>([authStateStore], ([authState], set) => {
  if (authState.status === "authenticated") {
    const { userId } = authState.authUser;

    onProfile({ userId }, set);

    return;
  }

  set(null);
});

export const toasterStore = writable<IToast[]>([]);

export const { enqueueToast, dequeueToast } = Toaster({
  setState: toasterStore.update,
  defaultDuration: 3000,
});
