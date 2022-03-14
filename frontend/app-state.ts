import { Channel } from "redux-saga";
import { spawn, takeEvery, takeLatest } from "redux-saga/effects";
import * as Game from "./features/game/game-state";
import * as Account from "./features/account/account-state";
import * as Profile from "./features/profile/profile-state";

export type IState = {
  account: Account.IState;
  game: Game.IState;
  profile: Profile.IState;
};

export type IAction = Game.IAction | Account.IAction | Profile.IAction;

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.namespace) {
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

    case "account": {
      return {
        ...state,
        account: Account.reducer(state.account, action),
      };
    }

    default:
      return state;
  }
};

export function* saga() {
  yield spawn(Game.saga);
  yield spawn(Account.saga);

  yield takeLatest("*", function* (action: IAction) {
    if (action.type === "account/logged-in") {
      const { userId } = action.payload;

      yield* Profile.saga({ userId });
    }
  });
}
