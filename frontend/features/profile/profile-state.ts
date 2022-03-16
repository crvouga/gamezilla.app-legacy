import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { Action, ActionType, InferActionUnion } from "../../utils";
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

export const initialState: IState = {
  type: "loading",
};

export const Actions = {
  found: Action<"profile", "found", ProfileDataAccess.IProfile>(
    "profile",
    "found"
  ),
  notFound: Action("profile", "not-found"),
};

export type IAction = InferActionUnion<typeof Actions>;

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ActionType("profile", "found"):
      return {
        type: "found",
        profile: action.payload,
      };

    case ActionType("profile", "not-found"):
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
}

const createProfileChan = ({ userId }: { userId: string }) => {
  return eventChannel<IAction>((emit) => {
    return ProfileDataAccess.onProfile({ userId })((profile) => {
      if (profile) {
        emit(Actions.found(profile));
        return;
      }

      emit(Actions.notFound());
    });
  });
};

function* watchProfileChan(action: IAction) {
  yield put(action);
}
