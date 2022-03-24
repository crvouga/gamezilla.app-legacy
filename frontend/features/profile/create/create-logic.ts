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
  profileCreate: Action<
    "profile/create",
    "mutate",
    { name: string; username: string; avatarUrl: string }
  >("profile/create", "mutate"),
  profileCreateSucceeded: Action("profile/create", "succeeded"),
  profileCreateFailed: Action("profile/create", "failed"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "profile/create/mutate") {
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
  create: (profile: {
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

export function* saga({ create }: IDataAccess, { userId }: { userId: string }) {
  yield takeEvery(actions.profileCreate, function* (action) {
    const response: Awaited<ReturnType<typeof create>> = yield call(create, {
      userId,
      ...action.payload,
    });

    if (response.type === "error") {
      yield put(actions.profileCreateFailed());
    }

    if (response.type === "success") {
      yield put(actions.profileCreateSucceeded());
    }
  });
}
