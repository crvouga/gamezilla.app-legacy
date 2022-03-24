import { EventChannel, eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import {
  Action,
  ActionType,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../../utils";

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
      type: "mutating";
    };

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  profileDelete: Action("profile/delete", "mutate"),
  profileDeleteSucceeded: Action("profile/delete", "succeeded"),
  profileDeleteFailed: Action("profile/delete", "failed"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "profile/delete/mutate") {
    return {
      type: "mutating",
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
  delete: (profile: {
    userId: string;
  }) => Promise<{ type: "success" } | { type: "error" }>;
};

export function* saga(dataAccess: IDataAccess, { userId }: { userId: string }) {
  yield takeEvery(actions.profileDelete, function* (action) {
    const response: Awaited<ReturnType<typeof dataAccess.delete>> = yield call(
      dataAccess.delete,
      {
        userId,
      }
    );

    if (response.type === "error") {
      yield put(actions.profileDeleteFailed());
    }

    if (response.type === "success") {
      yield put(actions.profileDeleteSucceeded());
    }
  });
}
