export type ILobbyUser = {
  userId: string;
  displayName: string;
  avatarUrl: string;
};

export type ILobbyGame = {
  gameId: string;
};

export type ILobby = {
  lobbyId: string;
  game: ILobbyGame;
  lobbyLeader: ILobbyUser;
};

export type ILobbyDataAccess = {
  create({ userId }: { userId: string }): Promise<Error[]>;
  // onUserLobbyStateChanged(
  //   { userId }: { userId: string },
  //   set: () => () => void
  // );
  // onLobbyStateChanged({ lobbyId }, set: () => () => void);
};
