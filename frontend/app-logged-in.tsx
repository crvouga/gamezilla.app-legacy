import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { IProfile } from "./features/profile/profile-data-access";
import { Splash } from "./ui";
import { Action, InferActionUnion, isActions } from "./utils";

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "not-found";
      route:
        | {
            type: "logout";
          }
        | {
            type: "create";
          };
    }
  | {
      type: "found";
      profile: IProfile;
      route: {
        type: "home";
      };
    };

export const initialState: IState = {
  type: "loading",
};

/* 


*/

const Actions = {
  profileFound: Action<"app-logged-in", "profile-found", { profile: IProfile }>(
    "app-logged-in",
    "profile-found"
  ),
  profileNotFound: Action("app-logged-in", "profile-not-found"),
};

export type IAction = InferActionUnion<typeof Actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(Actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "app-logged-in::profile-found":
      return {
        type: "found",
        profile: action.payload.profile,
        route: {
          type: "home",
        },
      };

    case "app-logged-in::profile-not-found":
      return {
        type: "not-found",
        route: {
          type: "create",
        },
      };
  }
};

/* 


*/

export type ISagaParams = {
  subscribeProfile: ({
    userId,
  }: {
    userId: string;
  }) => (emit: (profile: IProfile | null) => void) => () => void;
};

export function* saga(params: ISagaParams, { userId }: { userId: string }) {
  const profileChan = eventChannel(params.subscribeProfile({ userId }));

  yield takeEvery(profileChan, function* (profile) {
    if (profile) {
      yield put(Actions.profileFound({ profile }));
    } else {
      yield put(Actions.profileNotFound());
    }
  });
}

/* 


*/

export const view = ({
  state,
  dispatch,
}: {
  state: IState;
  dispatch: (action: IAction) => void;
}) => {
  return (
    <>
      {state.type === "loading" && <Splash subtitle="Loading profile..." />}
      {state.type === "found" && "found"}
      {state.type === "not-found" && "not-found"}
    </>
  );
};
