import { createReducer } from "@reduxjs/toolkit";
import { createAction } from "@gamezilla/utility";

const name: "gameSession" = "gameSession";

const actions = {
  create: createAction<{ userId: string }>(name, `create`),
};

type IGameSessionState = {
  users: {
    [userId: string]: undefined;
  };
};

const selectors = {
  slice: (state: { [name]: IGameSessionState }) => state[name],
};

const reducer = createReducer<IGameSessionState>({ users: {} }, {});

export const gameSession = {
  name,
  actions,
  reducer,
  selectors,
};

export function* gameSessionClientSaga() {
  yield;
}
