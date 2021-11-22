import { createAction, createReducer } from "@reduxjs/toolkit";
import { fork } from "child_process";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "../auth";

export const name: "profile" = "profile";

export type IProfile = {
  userId: string;
  avatarUrl: string;
  name: string;
};

export type IOnProfile = ({
  userId: string,
}) => (set: (profile: IProfile) => void) => () => void;

export type ISetProfile = (profile: IProfile) => Promise<void>;

export type IGetElseCreateProfile = ({
  userId,
}: {
  userId: string;
}) => Promise<IProfile>;

export type IProfileServices = {
  onProfile: IOnProfile;
  setProfile: ISetProfile;
  getElseCreateProfile: IGetElseCreateProfile;
};

const actions = {
  setState: createAction<IProfile>(`${name}/SET_STATE`),
  editProfile: createAction<{ avatarUrl: string; name: string }>(
    `${name}/editProfile`
  ),
  getElseCreateProfile: createAction(`${name}/getElseCreateProfile`),
};

export type IProfileState = IProfile | null;

const reducer = createReducer<IProfileState>(null, {
  [actions.setState.toString()]: (
    _state,
    action: ReturnType<typeof actions.setState>
  ) => {
    return action.payload;
  },
});

const selectors = {
  slice: (state: { [name]: IProfileState }): IProfileState => state[name],
};

export const profile = {
  actions,
  reducer,
  selectors,
  name,
};

export function* profileSaga({
  onProfile,
  setProfile,
  getElseCreateProfile,
}: IProfileServices) {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const { userId } = action.payload;

    const profile = yield call(getElseCreateProfile, { userId });

    yield put(actions.setState(profile));

    const profileChannel = eventChannel(onProfile(action.payload));

    yield takeLatest(profileChannel, function* (profile) {
      yield put(actions.setState(profile));
    });

    yield takeLatest(actions.editProfile, function* (action) {
      yield call(setProfile, { userId, ...action.payload });
    });
  });
}
