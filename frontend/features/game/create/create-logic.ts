import { call, put, takeLatest } from "redux-saga/effects";
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

export type IDataAccess = {
  create: () => Promise<{ type: "success" } | { type: "error" }>;
};

export function* saga({ create }: IDataAccess) {
  yield takeLatest(actions.gameCreate, function* (action) {
    const result: Awaited<ReturnType<typeof create>> = yield call(create);

    if (result.type === "error") {
      yield put(actions.gameCreateFailed());
    }

    if (result.type === "success") {
      yield put(actions.gameCreateSucceeded());
    }
  });
}
