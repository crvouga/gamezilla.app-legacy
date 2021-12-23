import { createAction, nanoid } from "@reduxjs/toolkit";
import { fork, takeEvery } from "redux-saga/effects";
import { ticTacToe } from "./tic-tac-toe";

const actions = {
  create: createAction("game/CREATE", () => ({
    payload: {
      gameId: nanoid(),
    },
  })),
  createSucceeded: createAction<{ gameId: string; userId: string }>(
    "game/CREATE_SUCCEEDED",
  ),
};

type IPlayer =
  | {
    type: "user";
    userId: string;
  }
  | {
    type: "bot";
  };

type IGameConfig = {
  type: "tic-tac-toe";
  rowCount: number;
  columnCount: number;
  x: IPlayer;
  o: IPlayer;
};

export type IGameSession = {
  gameConfig: IGameConfig;
  gameId: string;
  usersById: {
    [id: string]: {
      id: string;
    };
  };
};

function* saga() {
  yield fork(ticTacToe.saga);

  yield takeEvery(actions.create, function* () {
    yield;
  });
}

export const game = {
  saga,
  actions,
};
