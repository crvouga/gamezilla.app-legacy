import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "./auth";

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

export type IProfileServices = {
  onProfile: IOnProfile;
  setProfile: ISetProfile;
};

const actions = {
  setProfile: createAction<IProfile>(`${name}/setProfile`),
};

export type IProfileState = IProfile | null;

const reducer = createReducer<IProfileState>(null, {
  [actions.setProfile.toString()]: (
    _state,
    action: ReturnType<typeof actions.setProfile>
  ) => {
    return action.payload;
  },
});

const selectors = {
  slice: (state: { [name]: IProfileState }): IProfileState => state[name],
};

function* saga(services: IProfileServices) {
  yield takeLatest(auth.actions.setState, function* (action) {
    const authState = action.payload;

    if (authState.type === "signed-in") {
      const { userId } = authState.user;

      yield takeLatest(actions.setProfile, function* (action) {
        yield call(services.setProfile, { ...action.payload, userId });
      });

      const profileChannel = eventChannel(services.onProfile({ userId }));

      yield takeLatest(profileChannel, function* (profile) {
        yield put(actions.setProfile(profile));
      });
    }
  });
}

export const profile = {
  actions,
  reducer,
  selectors,
  name,
  saga,
};
