import { createAction } from "@reduxjs/toolkit";

const actions = {
  sync: createAction("game/SYNC"),
};

export const game = {
  actions,
};
