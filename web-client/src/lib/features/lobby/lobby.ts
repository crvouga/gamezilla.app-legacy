export type ILobbyId = string & { type: "LobbyId" };

export const toLobbyId = (lobbyId: string) => {
  //TODO: validate
  return lobbyId as ILobbyId;
};
