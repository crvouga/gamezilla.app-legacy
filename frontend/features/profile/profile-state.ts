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

export enum ActionType {
  Found = "profile/found",
  NotFound = "profile/not-found",
}

export type IFound = {
  namespace: "profile";
  type: ActionType.Found;
  payload: ProfileDataAccess.IProfile;
};

type INotFound = {
  namespace: "profile";
  type: ActionType.NotFound;
};

export type IAction = IFound | INotFound;

export const initialState: IState = {
  type: "loading",
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType.Found:
      return {
        type: "found",
        profile: action.payload,
      };

    case ActionType.NotFound:
      return {
        type: "not-found",
      };

    default:
      return state;
  }
};

/* 




*/

const createProfileChan = ({ userId }: { userId: string }) => {
  return eventChannel<IAction>((emit) => {
    return ProfileDataAccess.onProfile({ userId })((profile) => {
      if (profile) {
        emit({
          namespace: "profile",
          type: ActionType.Found,
          payload: profile,
        });
        return;
      }

      emit({
        namespace: "profile",
        type: ActionType.NotFound,
      });
    });
  });
};

function* watchProfileChan(action: IAction) {
  yield put<IAction>(action);
}

export function* saga({ userId }: { userId: string }) {
  const profileChan = createProfileChan({ userId });
  yield takeEvery(profileChan, watchProfileChan);
}
