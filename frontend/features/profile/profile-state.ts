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

export type IAction =
  | {
      namespace: "profile";
      type: "profile/not-found";
    }
  | {
      namespace: "profile";
      type: "profile/found";
      payload: {
        profile: ProfileDataAccess.IProfile;
      };
    };

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === "profile/found") {
    return {
      type: "found",
      profile: action.payload.profile,
    };
  }

  if (action.type === "profile/not-found") {
    return {
      type: "not-found",
    };
  }

  return state;
};

/* 



*/

export function* saga({ userId }: { userId: string }) {
  const profileChannel = eventChannel<IAction>((emit) => {
    return ProfileDataAccess.onProfile({ userId })((profile) => {
      if (profile) {
        emit({
          namespace: "profile",
          type: "profile/found",
          payload: { profile },
        });
        return;
      }
      emit({ namespace: "profile", type: "profile/not-found" });
    });
  });

  yield takeEvery(profileChannel, function* (action) {
    yield put(action);
  });
}
