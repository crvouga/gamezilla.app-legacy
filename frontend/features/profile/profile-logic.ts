import { EventChannel, eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import {
  Action,
  ActionType,
  InferActionMap,
  InferActionUnion,
  isActions,
} from "../../utils";

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
  status: "idle" | "updating" | "deleting";
};

export type INotFoundState = {
  type: "not-found";
  status: "idle" | "creating";
};

export type ILoadingState = {
  type: "loading";
};

export type IState = ILoadingState | IFoundState | INotFoundState;

export const actions = {
  found: Action<"profile", "found", IProfile>("profile", "found"),
  notFound: Action("profile", "not-found"),
  //
  update: Action<
    "profile",
    "update",
    {
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
      username: string;
      name: string;
      avatarUrl: string;
    }
  >("profile", "create"),
  createSucceeded: Action("profile", "create-succeeded"),
  createFailed: Action("profile", "create-failed"),
};

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

type IActionMap = InferActionMap<typeof actions>;

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
      yield put(actions.found(result.profile));
    }

    if (result.type === "not-found") {
      yield put(actions.notFound());
    }
  });
}
