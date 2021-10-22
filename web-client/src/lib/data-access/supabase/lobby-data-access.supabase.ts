import type { ILobbyDataAccess } from "../lobby.interface";

export const LobbyDataAccessSupabase = (): ILobbyDataAccess => {
  return {
    async create({ user }) {
      return {
        errors: [],
      };
    },

    async leave({ userId, lobbyId }) {
      return {
        errors: [],
      };
    },

    onUserLobbyStatesChanged({ userId }, set) {
      return () => {};
    },

    onLobbyStatesChanged({ lobbyId }, set) {
      return () => {};
    },
  };
};
