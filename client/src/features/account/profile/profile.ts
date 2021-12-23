import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "../auth/auth";
import { profileDataAccess } from "./profile-data-access";

const namespace: "profile" = "profile";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  displayName?: string;
};

const actions = {
  synced: createAction<IProfile>(`${namespace}/SYNCED`),
  update: createAction<{
    avatarUrl?: string;
    displayName?: string;
  }>(`${namespace}/UPDATE`),
};

type IState = IProfile | null;

const reducer = createReducer<IState>(null, (builder) => {
  builder.addCase(actions.synced, (_state, action) => {
    return action.payload;
  });
});

const selectors = {
  state: (state: IState): IState => state,
};

function* saga() {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const userId = action.payload.id;

    const profile: Awaited<
      ReturnType<typeof profileDataAccess.fetchElseCreate>
    > = yield call(profileDataAccess.fetchElseCreate, { userId });

    if (profile) {
      yield put(actions.synced(profile));
    }

    yield takeLatest(
      eventChannel(
        profileDataAccess.subscribe({ userId }),
      ),
      function* (profile) {
        yield put(actions.synced(profile));
      },
    );

    yield takeLatest(actions.update, function* (action) {
      yield call(profileDataAccess.update, { userId, ...action.payload });
    });
  });
}

export const profile = {
  namespace,
  actions,
  saga,
  reducer,
  selectors,
};
