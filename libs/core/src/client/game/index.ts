import { createAction, generateId } from "@gamezilla/utility";
import { createReducer } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import { auth } from "../auth";

const name: "game" = "game";

const actions = {
  create: createAction(name, "create"),
  created: createAction<{ userId: string; gameId: string }>(name, "created"),
};

type IGameState = {
  [gameId: string]: {
    gameId: string;
    users: {
      [userId: string]: null;
    };
  };
};

const selectors = {
  slice: (state: { [name]: IGameState }) => state[name],
};

const reducer = createReducer<IGameState>({}, (builder) => {
  builder.addCase(actions.created, (state, action) => {
    const { gameId, userId } = action.payload;

    state[gameId] = {
      gameId,
      users: {
        [userId]: null,
      },
    };
  });
});

export const game = {
  name,
  actions,
  reducer,
  selectors,
};

type ICreateGame = ({
  userId,
  gameId,
}: {
  userId: string;
  gameId: string;
}) => Promise<Error | null>;

export function* gameSaga({ createGame }: { createGame: ICreateGame }) {
  yield takeLatest(actions.created, function* (action) {
    yield call(createGame, action.payload);
  });

  yield takeLatest(auth.actions.signedIn, function* ({ payload: { userId } }) {
    yield takeLatest(actions.create, function* () {
      const gameId = generateId();

      yield put(
        actions.created({
          userId,
          gameId,
        })
      );
    });
  });
}
