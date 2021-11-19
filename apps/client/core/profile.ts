import { createAction } from "@reduxjs/toolkit";
import { call, takeEvery } from "redux-saga/effects";
import { auth } from "./auth";

type IProfileUpdate = {
  userId: string;
  avatarUrl: string;
  name: string;
};

type IUpdateProfile = (update: IProfileUpdate) => Promise<void>;

export const actions = {
  update: createAction<IProfileUpdate>("profile/update"),
};

function* profileSaga({ updateProfile }: { updateProfile: IUpdateProfile }) {
  yield takeEvery(actions.update, function* (action) {
    yield call(updateProfile, action.payload);
  });
}
