import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, takeLatest } from "redux-saga/effects";
import { auth } from "../auth/auth";
import { profileDataAccess } from "./profile-data-access";

const namespace: "profile" = "profile";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  displayName?: string;
};

const actions = {
  sync: createAction<IProfile>(`${namespace}/SYNC`),
  edit: createAction(`${namespace}/EDIT`),
};

type IState = IProfile | null;

const reducer = createReducer<IState>(null, (builder) => {
  builder.addCase(actions.sync, (_state, action) => {
    return action.payload;
  });
});

const selectors = {
  state: (state: IState): IState => state,
};

function* saga() {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const userId = action.payload.id;

    yield call(profileDataAccess.fetchElseCreate, { userId });

    yield takeLatest(
      eventChannel(profileDataAccess.subscribe({ userId })),
      function* (profile) {
        console.log({ profile });
      },
    );
  });
}

export const profile = {
  namespace,
  actions,
  saga,
  reducer,
  selectors,
};
