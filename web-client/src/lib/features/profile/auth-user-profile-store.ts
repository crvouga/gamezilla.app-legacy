import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import { authStateStore } from "../auth";
import type { IProfile } from "./on-profile";
import { onProfile } from "./on-profile";

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
