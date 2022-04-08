import { createAction } from "@reduxjs/toolkit";
import { EventChannel } from "redux-saga";
import { delay, fork, put, takeEvery } from "redux-saga/effects";
import { InferActionUnion } from "../../utils/action-creator";
import * as ProfileUpdate from "../profile-update/profile-update-state";

/**
 *
 *
 * State
 *
 *
 */

export type IProfile = {
  userId: string;
  avatarUrl: string;
  name: string;
  username: string;
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
      profileUpdate: ProfileUpdate.IState;
    };

export const initialState: IState = {
  type: "loading",
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
  gotProfileUpdate: createAction<
    ProfileUpdate.IAction,
    "profile/GOT_PROFILE_UPDATE"
  >("profile/GOT_PROFILE_UPDATE"),
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
    case "profile/GOT_PROFILE_UPDATE":
      if (state.type === "found") {
        return {
          ...state,
          profileUpdate: ProfileUpdate.reducer(
            state.profileUpdate,
            action.payload
          ),
        };
      }

      return state;

    case "profile/FOUND":
      return {
        type: "found",
        profile: action.payload,
        profileUpdate: {
          type: "idle",
        },
      };

    case "profile/NOT_FOUND":
      return {
        type: "not-found",
      };
  }
};

/*
 

Saga


*/

export type IDataAccess = {
  profileUpdate: ProfileUpdate.IDataAccess;
  createProfileEventChan: ({
    userId,
  }: {
    userId: string;
  }) => EventChannel<IAction>;
};

export function* saga({
  userId,
  dataAccess,
}: {
  dataAccess: IDataAccess;
  userId: string;
}) {
  const profileEventChan = dataAccess.createProfileEventChan({ userId });

  yield takeEvery(profileEventChan, function* (action) {
    yield delay(1000);
    yield put(action);
  });

  yield fork(ProfileUpdate.saga, {
    dataAccess: dataAccess.profileUpdate,
    userId,
  });
}
