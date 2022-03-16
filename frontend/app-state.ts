import { channel } from "redux-saga";
import {
  actionChannel,
  fork,
  put,
  spawn,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import * as Account from "./features/account/account-state";
import * as Game from "./features/game/game-state";
import * as Profile from "./features/profile/profile-state";

export type IState = {
  account: Account.IState;
  profile: Profile.IState;
  game: Game.IState;
};

export type IAction = Account.IAction | Profile.IAction | Game.IAction;

export const initialState: IState = {
  account: Account.initialState,
  profile: Profile.initialState,
  game: Game.initialState,
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.namespace) {
    case "account":
      return {
        ...state,
        account: Account.reducer(state.account, action),
      };

    case "profile":
      return {
        ...state,
        profile: Profile.reducer(state.profile, action),
      };

    case "game":
      return {
        ...state,
        game: Game.reducer(state.game, action),
      };

    default:
      return state;
  }
};

export function* saga() {
  yield spawn(Account.saga);

  yield takeLatest(
    Account.ActionType.LoggedIn,
    function* (action: Account.ILoggedIn) {
      yield fork(Profile.saga, { userId: action.payload.userId });
    }
  );

  yield takeLatest(
    Profile.ActionType.Found,
    function* (action: Profile.IFound) {
      yield fork(Game.saga, { profile: action.payload });
    }
  );
}
