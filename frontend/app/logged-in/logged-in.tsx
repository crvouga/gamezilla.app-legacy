import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { Splash } from "../../ui";
import {
  Action,
  InferActionUnion,
  isActions,
  ISubscription,
} from "../../utils";
import { Home } from "./home";
import { IProfile } from "./logged-in-data-access";
import { Logout } from "./logout";

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
      route:
        | {
            type: "home";
          }
        | {
            type: "logout";
          };
    };

export const initialState: IState = {
  type: "loading",
};

/* 


*/

const actions = {
  profileFound: Action<"logged-in", "profile-found", { profile: IProfile }>(
    "logged-in",
    "profile-found"
  ),
  profileNotFound: Action("logged-in", "profile-not-found"),
};

export type IAction = InferActionUnion<typeof actions>;

export const isAction = (action: unknown): action is IAction => {
  return isActions(actions, action);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "logged-in::profile-found":
      return {
        type: "found",
        profile: action.payload.profile,
        route: {
          type: "home",
        },
      };

    case "logged-in::profile-not-found":
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

export type IOnProfile = ({
  userId,
}: {
  userId: string;
}) => ISubscription<IProfile | null>;

export type IDataAccess = {
  onProfile: IOnProfile;
};

export function* saga(dataAccess: IDataAccess, { userId }: { userId: string }) {
  const profileChan = eventChannel(dataAccess.onProfile({ userId }));

  yield takeEvery(profileChan, function* (profile) {
    if (profile) {
      yield put(actions.profileFound({ profile }));
    } else {
      yield put(actions.profileNotFound());
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
      {state.type === "found" && (
        <>
          {state.route.type === "home" && <Home.view profile={state.profile} />}
          {state.route.type === "logout" && <Logout.view />}
        </>
      )}
      {state.type === "not-found" && "not-found"}
    </>
  );
};
