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

export type IUpdateProfile = (profile: IProfile) => Promise<{ error: Error }>;

export type IGetElseCreateProfile = ({
  userId,
}: {
  userId: string;
}) => Promise<IProfile>;

const actions = {
  setState: createAction<IProfileState>(`${name}/SET_STATE`),
  editProfile: createAction<{ avatarUrl: string; name: string }>(
    `${name}/editProfile`
  ),
  editProfileSuccess: createAction(`${name}/editProfileSuccess`),
  editProfileError: createAction<{ message: string }>(
    `${name}/editProfileError`
  ),
  getElseCreateProfile: createAction(`${name}/getElseCreateProfile`),
};

export type IProfileState =
  | {
      type: "loaded";
      profile: IProfile;
    }
  | {
      type: "loading";
    };

const reducer = createReducer<IProfileState>(
  { type: "loading" },
  {
    [actions.setState.toString()]: (
      _state,
      action: ReturnType<typeof actions.setState>
    ) => {
      return action.payload;
    },
  }
);

const selectors = {
  slice: (state: { [name]: IProfileState }): IProfileState => state[name],
};

export const profile = {
  actions,
  reducer,
  selectors,
  name,
};
// type T = Awaited<Promise<PromiseLike<number>> // => number

export function* profileSaga({
  onProfile,
  updateProfile,
  getElseCreateProfile,
}: {
  onProfile: IOnProfile;
  updateProfile: IUpdateProfile;
  getElseCreateProfile: IGetElseCreateProfile;
}) {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const { userId } = action.payload;

    const profileChannel = eventChannel(onProfile(action.payload));

    yield takeLatest(profileChannel, function* (profile) {
         yield put(
      actions.setState({
        type: "loaded",
        profile,
      })
    );
    });

    yield takeLatest(actions.editProfile, function* (action) {
      const { error }: { error: Error } = yield call(updateProfile, {
        userId,
        ...action.payload,
      });

      if (error) {
        yield put(actions.editProfileError({ message: error.message }));
        return;
      }

      yield put(actions.editProfileSuccess());
    });

    const profile = yield call(getElseCreateProfile, { userId });

    yield put(
      actions.setState({
        type: "loaded",
        profile,
      })
    );
  });
}
