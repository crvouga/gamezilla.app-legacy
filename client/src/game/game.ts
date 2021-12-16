import { createAction, nanoid } from "@reduxjs/toolkit";

type IGame = "tic-tac-toe";

type IGameSession = {
  game?: IGame;
  creatorId: string;
  state: "in-game" | "in-lobby";
  users: {
    [userId: string]: {
      userId: string;
    };
  };
};

const actions = {
  sync: createAction("game/SYNC"),
  create: createAction("game/CREATE", () => ({
    payload: {
      gameId: nanoid(),
    },
  })),
};

export const game = {
  actions,
};
