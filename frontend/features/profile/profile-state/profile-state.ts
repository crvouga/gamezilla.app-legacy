import { createAction } from "@reduxjs/toolkit";
import { EventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { InferActionUnion } from "../../../utils";
import { dataAccess } from "./profile-state-data-access";

/**
 *
 *
 * State
 *
 *
 */

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  name?: string;
  username?: string;
};

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "not-found";
    }
  | {
      type: "found";
      profile: IProfile;
    };

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  found: createAction<IProfile, "profile/FOUND">("profile/FOUND"),
  notFound: createAction("profile/NOT_FOUND"),
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
  if (action.type === "profile/FOUND") {
    return {
      type: "found",
      profile: action.payload,
    };
  }

  if (action.type === "profile/NOT_FOUND") {
    return {
      type: "not-found",
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

export type IDataAccess = {
  createProfileEventChan: ({
    userId,
  }: {
    userId: string;
  }) => EventChannel<IAction>;
};

export function* saga({ userId }: { userId: string }) {
  const profileEventChan = dataAccess.createProfileEventChan({ userId });

  yield takeEvery(profileEventChan, function* (action) {
    yield put(action);
  });
}
