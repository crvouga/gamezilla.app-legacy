import { eventChannel } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
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
  Update = "profile/update",
  Delete = "profile/delete",
  Create = "profile/create",
}

export type IFound = {
  namespace: "profile";
  type: ActionType.Found;
  payload: ProfileDataAccess.IProfile;
};

type ICreate = {
  namespace: "profile";
  type: ActionType.Create;
};

type IUpdate = {
  namespace: "profile";
  type: ActionType.Update;
  payload: {
    userId: string;
    username?: string;
    avatarUrl?: string;
    name?: string;
  };
};

export type IAction =
  | IFound
  | {
      namespace: "profile";
      type: ActionType.NotFound;
    }
  | IUpdate
  | {
      namespace: "profile";
      type: ActionType.Delete;
    }
  | ICreate;

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

export function* saga({ userId }: { userId: string }) {
  const profileChan = createProfileChan({ userId });
  yield takeEvery(profileChan, watchProfileChan);
  yield takeEvery(ActionType.Update, watchUpdate);
}

function* watchUpdate(action: IUpdate) {
  yield call(ProfileDataAccess.updateProfile, action.payload);
}

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
