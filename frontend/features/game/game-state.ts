import { createAction } from "@reduxjs/toolkit";
import { InferActionUnion } from "../../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IGameId = "tic-tac-toe";

export type IState =
  | {
      type: "closed";
    }
  | {
      type: "opened";
      gameId: IGameId;
    };

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  open: createAction<IGameId, "game/OPEN">("game/OPEN"),
  close: createAction("game/CLOSE"),
};

export type IAction = InferActionUnion<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "game/CLOSE":
      return {
        type: "closed",
      };

    case "game/OPEN":
      return {
        type: "opened",
        gameId: action.payload,
      };
  }
};

/**
 *
 *
 * Saga
 *
 *
 */

export function* saga() {}
