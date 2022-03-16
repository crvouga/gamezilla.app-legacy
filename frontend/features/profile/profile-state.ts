import { eventChannel } from "redux-saga";
import { call, put, takeEvery, takeLeading } from "redux-saga/effects";
import {
  Action,
  ActionType,
  InferActionMap,
  InferActionUnion,
} from "../../utils";
import * as ProfileDataAccess from "./profile-data-access";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "found";
      profile: ProfileDataAccess.IProfile;
      status: "idle" | "updating" | "deleting";
    }
  | {
      type: "not-found";
      status: "idle" | "creating";
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
  //
  update: Action<
    "profile",
    "update",
    {
      userId: string;
      avatarUrl?: string;
      username?: string;
      name?: string;
    }
  >("profile", "update"),
  updateSucceeded: Action("profile", "update-succeeded"),
  updateFailed: Action("profile", "update-failed"),
  //
  delete: Action<"profile", "delete", { userId: string }>("profile", "delete"),
  deleteSucceeded: Action("profile", "delete-succeeded"),
  deleteFailed: Action("profile", "delete-failed"),
  //
  create: Action<
    "profile",
    "create",
    {
      userId: string;
      username: string;
      name: string;
      avatarUrl: string;
    }
  >("profile", "create"),
  createSucceeded: Action("profile", "create-succeeded"),
  createFailed: Action("profile", "create-failed"),
};

export type IAction = InferActionUnion<typeof Actions>;

type IActionMap = InferActionMap<typeof Actions>;

export const reducer = (state: IState, action: IAction): IState => {
  switch (state.type) {
    case "not-found":
      switch (action.type) {
        case ActionType("profile", "found"):
          return {
            type: "found",
            profile: action.payload,
            status: "idle",
          };

        case ActionType("profile", "create"):
          return {
            ...state,
            status: "creating",
          };

        case ActionType("profile", "create-succeeded"):
          return {
            ...state,
            status: "idle",
          };

        default:
          return state;
      }

    case "loading":
      switch (action.type) {
        case ActionType("profile", "found"):
          return {
            type: "found",
            profile: action.payload,
            status: "idle",
          };

        case ActionType("profile", "not-found"):
          return {
            type: "not-found",
            status: "idle",
          };

        default:
          return state;
      }

    case "found":
      switch (action.type) {
        case ActionType("profile", "not-found"):
          return {
            type: "not-found",
            status: "idle",
          };

        case ActionType("profile", "delete"):
          return {
            ...state,
            status: "deleting",
          };

        case ActionType("profile", "delete-succeeded"):
          return {
            ...state,
            status: "idle",
          };

        case ActionType("profile", "update"):
          return {
            ...state,
            status: "updating",
          };

        case ActionType("profile", "update-succeeded"):
          return {
            ...state,
            status: "idle",
          };

        default:
          return state;
      }

    default:
      return state;
  }
};

export const Selectors = {
  isUpdating: (state: IState) =>
    state.type === "found" && state.status === "updating",
};

/* 




*/

export function* saga({ userId }: { userId: string }) {
  const profileChan = createProfileChan({ userId });

  yield takeEvery(profileChan, watchProfileChan);
  yield takeLeading(Actions.update, watchUpdate);
  yield takeLeading(Actions.delete, watchDelete);
  yield takeLeading(Actions.create, watchCreate);
}

function* watchCreate(action: IActionMap["create"]) {
  yield call(ProfileDataAccess.createProfile, action.payload);

  yield put(Actions.createSucceeded());
}

function* watchUpdate(action: IActionMap["update"]) {
  yield call(ProfileDataAccess.updateProfile, action.payload);

  yield put(Actions.updateSucceeded());
}

function* watchDelete(action: IActionMap["delete"]) {
  yield call(ProfileDataAccess.deleteProfile, action.payload);

  yield put(Actions.deleteSucceeded());
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
