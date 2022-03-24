import { EventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { Action, InferActionUnion } from "../../../utils";

/**
 *
 *
 * State
 *
 *
 */

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  gameRoomId?: string;
};

export type IFoundState = {
  type: "found";
  profile: IProfile;
};

export type INotFoundState = {
  type: "not-found";
};

export type ILoadingState = {
  type: "loading";
};

export type IState = ILoadingState | IFoundState | INotFoundState;

/**
 *
 *
 * Reducer
 *
 *
 */

export const actions = {
  profileFound: Action<"profile/subscribe", "found", IProfile>(
    "profile/subscribe",
    "found"
  ),
  profileNotFound: Action("profile/subscribe", "not-found"),
};

export type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "profile/subscribe/found") {
    return {
      type: "found",
      profile: action.payload,
    };
  }

  if (action.type === "profile/subscribe/not-found") {
    return {
      type: "not-found",
    };
  }

  return state;
};

/**
 *
 *
 * Saga
 *
 *
 */

export type IDataAccess = {
  createProfileChan: ({
    userId,
  }: {
    userId: string;
  }) => EventChannel<
    { type: "found"; profile: IProfile } | { type: "not-found" }
  >;
};

export function* saga(
  { createProfileChan }: IDataAccess,
  { userId }: { userId: string }
) {
  const profileChan = createProfileChan({ userId });

  yield takeEvery(profileChan, function* (result) {
    if (result.type === "found") {
      yield put(actions.profileFound(result.profile));
    }

    if (result.type === "not-found") {
      yield put(actions.profileNotFound());
    }
  });
}
