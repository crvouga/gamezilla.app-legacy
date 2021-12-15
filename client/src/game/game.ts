import { createAction, nanoid } from "@reduxjs/toolkit";

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
