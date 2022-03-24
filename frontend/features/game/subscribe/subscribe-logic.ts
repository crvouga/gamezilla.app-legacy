import { Action, InferActionUnion } from "../../../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "connected";
      roomId: string;
      sessionId: string;
    }
  | {
      type: "disconnected";
    };

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  connected: Action<
    "game/subscribe",
    "connected",
    { roomId: string; sessionId: string }
  >("game/subscribe", "connected"),
  disconnected: Action("game/subscribe", "disconnected"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "game/subscribe/connected") {
    return {
      type: "connected",
      roomId: action.payload.roomId,
      sessionId: action.payload.sessionId,
    };
  }

  if (action.type === "game/subscribe/disconnected") {
    return {
      type: "disconnected",
    };
  }

  return state;
};

/**
 *
 *
 * Saga
 *
 *
 */

export function* saga() {}
