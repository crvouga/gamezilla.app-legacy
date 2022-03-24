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
      type: "idle";
    }
  | {
      type: "creating";
    };

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  gameCreate: Action("game/create", "mutate"),
  gameCreateSucceeded: Action("game/create", "succeeded"),
  gameCreateFailed: Action("game/create", "failed"),
};

type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "game/create/mutate") {
    return {
      type: "creating",
    };
  }

  return {
    type: "idle",
  };
};

/**
 *
 *
 * Saga
 *
 *
 */

type IDataAccess = {
  create: () => {};
};

export function* saga() {}
