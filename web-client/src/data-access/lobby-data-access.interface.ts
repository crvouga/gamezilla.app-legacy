export type ILobbyUser = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
};

export type ILobbyGame = {
  gameId: string;
};

export type ILobbyEvent =
  | {
      type: "USER_CREATED_LOBBY";
      eventId: string;
      lobbyId: string;
      user: ILobbyUser;
    }
  | {
      type: "USER_LEFTED_LOBBY";
      eventId: string;
      lobbyId: string;
      userId: string;
    };

export type ILobbyState = {
  lobbyId: string;
  users: {
    [userId: string]: ILobbyUser;
  };
};

const removeKey = <T>(key: keyof T, object: T) => {
  const { [key]: _value, ...removedKey } = object;
  return removedKey;
};

export const lobbyStateReducer = (
  state: ILobbyState | null,
  event: ILobbyEvent
): ILobbyState | null => {
  switch (event.type) {
    case "USER_CREATED_LOBBY":
      return {
        lobbyId: event.lobbyId,
        users: {
          [event.user.userId]: event.user,
        },
      };

    case "USER_LEFTED_LOBBY":
      const nextState = {
        ...state,
        users: removeKey(event.userId, state.users),
      };

      if (Object.keys(nextState.users).length === 0) {
        return null;
      }

      return nextState;

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
  leave({
    userId,
    lobbyId,
  }: {
    lobbyId: string;
    userId: string;
  }): Promise<{
    errors: Error[];
  }>;

  onUserLobbyStatesChanged: (
    { userId: string },
    set: (lobbyStates: ILobbyState[]) => void
  ) => () => void;

  onLobbyStatesChanged: (
    { lobbyId: string },
    set: (lobbyStates: ILobbyState[]) => void
  ) => () => void;
};
