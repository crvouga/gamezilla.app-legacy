import { readable } from "svelte/store";
import { dataAccess } from "./data-access";
import type { IAuthState } from "./data-access/auth-data-access.interface";

export const authStateStore = readable<IAuthState>(
  {
    status: "loading",
  },
  dataAccess.auth.onAuthStateChanged
);

// export const lobbyStateStore = readable({}, (setLobbyState) => {
//   return authStateStore.subscribe((authState) => {
//     if (authState.status === "authenticated") {
//       return dataAccess.lobby.onUserLobbyStateChanged(
//         {
//           userId: authState.authUser.userId,
//         },
//         setLobbyState
//       );
//     }
//   });
// });
