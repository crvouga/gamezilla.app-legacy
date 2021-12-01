import { Awaited } from "@utility";
import { createAction } from "@shared";
import { createReducer } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "../auth";
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

export type IUpdateProfile = (
  profile: IProfile
) => Promise<{ error: Error | null }>;

export type IFindProfile = ({
  userId,
}: {
  userId: string;
}) => Promise<IProfile | null>;

export type ICreateProfile = ({ userId }: { userId: string }) => Promise<void>;

export type IFindElseCreateProfile = IFindProfile;

const actions = {
  sync: createAction<IProfileState>(name, `sync`),

  edit: createAction<{ avatarUrl: string; name: string }>(name, `edit`),
  editSuccess: createAction(name, `edit-success`),
  editError: createAction<{ message: string }>(name, `edit-error`),
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
  (builder) => {
    builder.addCase(actions.sync, (_state, action) => {
      return action.payload;
    });
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
  findElseCreateProfile,
}: {
  onProfile: IOnProfile;
  updateProfile: IUpdateProfile;
  findElseCreateProfile: IFindElseCreateProfile;
}) {
  yield takeLatest(auth.actions.signedIn, function* (action) {
    const { userId } = action.payload;

    const profile: Awaited<ReturnType<
      typeof findElseCreateProfile
    >> = yield call(findElseCreateProfile, { userId });

    yield put(
      actions.sync({
        type: "loaded",
        profile,
      })
    );

    const profileChannel = eventChannel(onProfile(action.payload));

    yield takeLatest(profileChannel, function* (profile) {
      yield put(actions.sync({ type: "loaded", profile }));
    });

    yield takeLatest(actions.edit, function* (action) {
      yield put(
        actions.sync({
          type: "loaded",
          profile: {
            userId,
            ...action.payload,
          },
        })
      );

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
      yield put(
        toast.actions.present({ message: "Updated Profile", duration: 3000 })
      );
    });
  });
}
