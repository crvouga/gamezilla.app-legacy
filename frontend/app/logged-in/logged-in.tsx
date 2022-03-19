import { Button } from "react-native-paper";
import { eventChannel } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import {
  Action,
  InferActionUnion,
  isActions,
  ISubscription,
} from "../../utils";
import * as Home from "./home/home";
import * as Logout from "./logout/logout";

type IProfileFoundRoute =
  | {
      type: "home";
    }
  | {
      type: "logout";
    };

type IProfileNotFoundRoute =
  | {
      type: "logout";
    }
  | {
      type: "create";
    };

export type IState =
  | {
      type: "loading";
    }
  | {
      type: "not-found";
      route: IProfileNotFoundRoute;
    }
  | {
      type: "found";
      profile: IProfile;
      route: IProfileFoundRoute;
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

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  gameRoomId?: string;
};

export type IOnProfile = ({
  userId,
}: {
  userId: string;
}) => ISubscription<IProfile | null>;

export type IDataAccess = {
  onProfile: IOnProfile;
};

function* watchProfileChan(profile: IProfile | null) {
  if (profile) {
    yield put(actions.profileFound({ profile }));
  } else {
    yield put(actions.profileNotFound());
  }
}

export function* saga(dataAccess: IDataAccess, { userId }: { userId: string }) {
  const profileChan = eventChannel(dataAccess.onProfile({ userId }));

  yield takeEvery(profileChan, watchProfileChan);
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
      <Button onPress={() => {}}>Logout</Button>
    </>
  );
};
