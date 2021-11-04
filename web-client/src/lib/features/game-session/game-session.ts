export type IGameSession = {
  gameSessionId: string;
  users: {
    [userId: string]: {
      userId: string;
      name?: string;
      avatarUrl?: string;
    };
  };
};
