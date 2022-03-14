import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import * as ProfileDataAccess from "./profile-data-access";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "found";
      profile: ProfileDataAccess.IProfile;
    }
  | {
      type: "not-found";
    };

export const actions = {
  notFound: createAction("profile/not-found"),
  found: createAction<{ profile: ProfileDataAccess.IProfile }, "profile/found">(
    "profile/found"
  ),
};

export const reducer = createReducer<IState>({ type: "loading" }, (builder) => {
  builder.addCase(actions.found, (_state, action) => {
    return {
      type: "found",
      profile: action.payload.profile,
    };
  });

  builder.addCase(actions.notFound, () => {
    return {
      type: "not-found",
    };
  });
});

/* 



*/

export function* saga({ userId }: { userId: string }) {
  const profileChannel = eventChannel<
    ReturnType<typeof actions.found> | ReturnType<typeof actions.notFound>
  >((emit) => {
    return ProfileDataAccess.onProfile({ userId })((profile) => {
      if (profile) {
        emit(actions.found({ profile }));
        return;
      }
      emit(actions.notFound());
    });
  });

  yield takeEvery(profileChannel, function* (action) {
    yield put(action);
  });
}
