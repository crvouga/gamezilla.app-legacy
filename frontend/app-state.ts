import { fork, spawn, takeLatest } from "redux-saga/effects";
import * as Auth from "../common/account/auth-state/auth-state";
import * as Profile from "../common/account/profile-state/profile-state";
import * as Game from "../common/games/game-state";
import { InferActionUnion } from "../common/utils/action-creator";

/**
 *
 *
 * State
 *
 *
 */

export type IState = {
  auth: Auth.IState;
  profile: Profile.IState;
  game: Game.IState;
};

export const initialState: IState = {
  auth: Auth.initialState,
  profile: Profile.initialState,
  game: Game.initialState,
};

/**
 *
 *
 * Actions
 *
 *
 */

export const actions = {
  ...Auth.actions,
  ...Profile.actions,
  ...Game.actions,
};

export type IAction = InferActionUnion<typeof actions>;

/**
 *
 *
 * Reducer
 *
 *
 */

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "auth/SIGNED_IN":
    case "auth/SIGNED_OUT":
      return {
        ...state,
        auth: Auth.reducer(state.auth, action),
      };

    case "game/STOPPED":
    case "game/STARTED":
    case "game/START":
    case "game/FOCUSED":
    case "game/BLURRED":
    case "game/STOP":
    case "tic-tac-toe/BOARD_PRESSED":
    case "tic-tac-toe/MOVED":
    case "tic-tac-toe/RESTART":
      return {
        ...state,
        game: Game.reducer(state.game, action),
      };

    case "profile/FOUND":
    case "profile/NOT_FOUND":
    case "profile/GOT_PROFILE_UPDATE":
      return {
        ...state,
        profile: Profile.reducer(state.profile, action),
      };
  }
};

/**
 *
 *
 * Saga
 *
 *
 */

export type IDataAccess = {
  auth: Auth.IDataAccess;
  profile: Profile.IDataAccess;
};

export function* saga({
  dataAccess,
  selector,
}: {
  selector: (_: unknown) => IState;
  dataAccess: IDataAccess;
}) {
  yield spawn(Auth.saga, { dataAccess: dataAccess.auth });

  yield fork(Game.saga, { selector: (_) => selector(_).game });

  yield takeLatest(Auth.actions.signedIn, function* (action) {
    const { userId } = action.payload;

    yield fork(Profile.saga, {
      dataAccess: dataAccess.profile,
      userId,
    });
  });
}
