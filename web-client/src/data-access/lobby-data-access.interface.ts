export type ILobbyUser = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
};

export type ILobbyGame = {
  gameId: string;
};

export type ILobby = {
  lobbyId: string;
  game: ILobbyGame;
  lobbyLeaderUserId: string;
  users: {
    [userId: string]: ILobbyUser;
  };
};

export type ILobbyEvent = {
  type: "USER_LOBBY_CREATED";
  eventId: string;
  lobbyId: string;
  user: ILobbyUser;
};

export type ILobbyState = {
  lobbyId: string;
  users: {
    [userId: string]: ILobbyUser;
  };
};

export const toInitialLobbyState = ({
  lobbyId,
}: {
  lobbyId: string;
}): ILobbyState => {
  return {
    lobbyId,
    users: {},
  };
};

export const lobbyStateReducer = (
  state: ILobbyState | null,
  event: ILobbyEvent
): ILobbyState => {
  switch (event.type) {
    case "USER_LOBBY_CREATED":
      return {
        lobbyId: event.lobbyId,
        users: {
          [event.user.userId]: event.user,
        },
      };

    default:
      return state;
  }
};

export type ILobbyDataAccess = {
  create({
    user,
  }: {
    user: ILobbyUser;
  }): Promise<{
    errors: Error[];
    lobbyId?: string;
  }>;
};
