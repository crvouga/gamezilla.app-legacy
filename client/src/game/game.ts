import { createAction, nanoid } from "@reduxjs/toolkit";
import { takeEvery } from "redux-saga/effects";

const actions = {
  sync: createAction("game/SYNC"),
  create: createAction("game/CREATE", () => ({
    payload: {
      gameId: nanoid(),
    },
  })),
  createSucceeded: createAction<{ gameId: string; userId: string }>(
    "game/CREATE_SUCCEEDED"
  ),
};

function* saga() {
  yield takeEvery(actions.create, function* () {
    yield;
  });
}

export const game = {
  saga,
  actions,
};
