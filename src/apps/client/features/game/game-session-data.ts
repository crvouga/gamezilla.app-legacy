


export type IGameSession<TGameState> = {
  game: {
    name: string;
    state: TGameState;
  };
  hostId: string;
  users: {
    [userId: string]: {
      userId: string;
      username: string;
      avatarUrl: string;
    };
  };
};

export type ICommand = {
  type: "game-session/CREATE";
};

export type IEvent = {
  type: "game-session/CREATE";
};

export const generateId = () => {
    return String(Math.floor(Math.random() * 1_000_000))
}