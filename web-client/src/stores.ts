import { readable, writable } from "svelte/store";
import { dataAccess } from "./data-access";
import type { IAuthState } from "./data-access/auth-data-access.interface";
import type { ILobbyState } from "./data-access/lobby-data-access.interface";

export const authStateStore = readable<IAuthState>(
  {
    status: "loading",
  },
  dataAccess.auth.onAuthStateChanged,
);

export const lobbyStatesStore = readable<ILobbyState[]>([], (set) => {
  return authStateStore.subscribe((authState) => {
    if (authState.status === "authenticated") {
      return dataAccess.lobby.onUserLobbyStatesChanged(
        {
          userId: authState.authUser.userId,
        },
        set,
      );
    }
  });
});
