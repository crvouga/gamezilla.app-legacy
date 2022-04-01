import { createAction } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLeading } from "redux-saga/effects";
import {
  createEventEmitter,
  InferActionMap,
  InferActionUnion,
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
      type: "loading";
    }
  | {
      type: "success";
    }
  | {
      type: "failed";
    };

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  update: createAction<
    {
      avatarUrl?: string;
      username?: string;
      name?: string;
    },
    "profileUpdate/UPDATE"
  >("profileUpdate/UPDATE"),
  updateSucceeded: createAction("profileUpdate/SUCCEEDED"),
  updateFailed: createAction("profileUpdate/FAILED"),
};

export type IAction = InferActionUnion<typeof actions>;

export type IActionMap = InferActionMap<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "profileUpdate/UPDATE":
      return {
        type: "loading",
      };

    case "profileUpdate/SUCCEEDED":
      return {
        type: "success",
      };

    case "profileUpdate/FAILED":
      return {
        type: "failed",
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

export type IDataAccess = {
  update: (profile: {
    userId: string;
    avatarUrl?: string;
    name?: string;
    username?: string;
  }) => Promise<
    | {
        type: "success";
      }
    | {
        type: "error";
      }
  >;
};

export const eventEmitter = createEventEmitter<IActionMap>();

// const eventChan = eventChannel((emit) => {
//   eventEmitter.on("update", emit);
//   eventEmitter.on("updateFailed", emit);
//   eventEmitter.on("updateSucceeded", emit);
// });

export function* saga({
  userId,
  dataAccess,
}: {
  userId: string;
  dataAccess: IDataAccess;
}) {
  yield takeLeading(actions.update, function* watchSubmit(action) {
    const response: Awaited<ReturnType<typeof dataAccess.update>> = yield call(
      dataAccess.update,
      {
        userId,
        ...action.payload,
      }
    );

    if (response.type === "success") {
      yield put(actions.updateSucceeded());
    }

    if (response.type === "error") {
      yield put(actions.updateFailed());
    }
  });
}
