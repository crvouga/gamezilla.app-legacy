import { createAction, createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "../auth";
import { Awaited } from "@gamezilla/utility";
import { toast } from "../toasts";

export const name: "profile" = "profile";

export type IProfile = {
  userId: string;
  avatarUrl: string;
  name: string;
};

export type IOnProfile = (_: {
  userId: string;
}) => (set: (profile: IProfile) => void) => () => void;

export type IUpdateProfile = (profile: IProfile) => Promise<{ error: Error }>;

export type IGetElseCreateProfile = ({
  userId,
}: {
  userId: string;
}) => Promise<IProfile>;

const actions = {
  setState: createAction<IProfileState>(`${name}/set-state`),
  edit: createAction<{ avatarUrl: string; name: string }>(`${name}/edit`),
  editSuccess: createAction(`${name}/edit-success`),
  editError: createAction<{ message: string }>(`${name}/edit-error`),
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
  {
    type: "loading",
  },
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

    yield takeLatest(actions.edit, function* (action) {
      const { error }: { error: Error } = yield call(updateProfile, {
        userId,
        ...action.payload,
      });

      if (error) {
        yield put(actions.editError({ message: error.message }));
        return;
      }

      yield put(actions.editSuccess());
    });

    yield takeLatest(actions.editSuccess, function* () {
      yield put(toast.actions.present({ message: "Updated Profile" }));
    });

    const profile: Awaited<ReturnType<typeof getElseCreateProfile>> =
      yield call(getElseCreateProfile, { userId });

    yield put(
      actions.setState({
        type: "loaded",
        profile,
      })
    );
  });
}
