import { spawn, takeLatest } from "redux-saga/effects";
import * as Account from "./features/account/account-state";
import * as Game from "./features/game/game-state";
import * as Profile from "./features/profile/profile-state";
import * as Routing from "./app-routing-state";

export type IState = {
  account: Account.IState;
  profile: Profile.IState;
  game: Game.IState;
  routing: Routing.IState;
};

export type IAction =
  | Account.IAction
  | Profile.IAction
  | Game.IAction
  | Routing.IAction;

export const isAction = (action: unknown): action is IAction => {
  return (
    Account.isAction(action) ||
    Profile.isAction(action) ||
    Game.isAction(action) ||
    Routing.isAction(action)
  );
};

export const initialState: IState = {
  account: Account.initialState,
  profile: Profile.initialState,
  game: Game.initialState,
  routing: Routing.initialState,
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.namespace) {
    case "routing":
      return {
        ...state,
        routing: Routing.reducer(state.routing, action),
      };

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
  yield spawn(Routing.saga);
  yield spawn(Game.saga);

  yield takeLatest(Account.Actions.loggedIn, function* (action) {
    yield* Profile.saga({ userId: action.payload.userId });
  });
}
