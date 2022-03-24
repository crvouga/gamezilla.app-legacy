import { EventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
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
      type: "mutating";
    };

export const initialState: IState = {
  type: "idle",
};

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  profileUpdate: Action<
    "profile/update",
    "mutate",
    {
      avatarUrl: string;
      name: string;
      username: string;
    }
  >("profile/update", "mutate"),
  profileUpdateSucceeded: Action("profile/update", "succeeded"),
  profileUpdateFailed: Action("profile/update", "failed"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "profile/update/mutate") {
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
  update: (profile: {
    userId: string;
    avatarUrl: string;
    name: string;
    username: string;
  }) => Promise<
    | {
        type: "success";
      }
    | {
        type: "error";
      }
  >;
};

export function* saga({ update }: IDataAccess, { userId }: { userId: string }) {
  yield takeEvery(actions.profileUpdate, function* (action) {
    const response: Awaited<ReturnType<typeof update>> = yield call(update, {
      userId,
      ...action.payload,
    });

    if (response.type === "error") {
      yield put(actions.profileUpdateFailed());
    }

    if (response.type === "success") {
      yield put(actions.profileUpdateSucceeded());
    }
  });
}
