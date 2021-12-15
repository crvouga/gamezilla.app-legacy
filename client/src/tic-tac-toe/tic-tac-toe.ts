import { createAction, createReducer } from "@reduxjs/toolkit";
import { cartesianProduct, range } from "../utility";
import { select, takeEvery, put } from "redux-saga/effects";

export type Player = "x" | "o";

export type Position = {
  column: number;
  row: number;
};

export type Move = Position & {
  player: Player;
};

export const toLines = ({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}[] => {
  const vertical = range(1, columnCount).map((column) => ({
    x1: 0,
    y1: column,
    x2: columnCount,
    y2: column,
  }));

  const horizontal = range(1, rowCount).map((row) => ({
    x1: row,
    y1: 0,
    x2: row,
    y2: rowCount,
  }));

  return vertical.concat(horizontal);
};

export const toPositions = ({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}): Position[] => {
  return cartesianProduct(
    range(0, columnCount),
    range(0, rowCount)
  ).map(([column, row]) => ({ column, row }));
};

const namespace = "tic-tac-toe";

type MoveFailedReason = "POSITION_TAKEN" | "NOT_TURN";

const actions = {
  clicked: createAction<Position>(`${namespace}/CLICKED`),
  move: createAction<Move>(`${namespace}/MOVE`),
  moveSucceeded: createAction<Move>(`${namespace}/MOVE_SUCCEEDED`),
  moveFailed: createAction<{ reason: MoveFailedReason }>(
    `${namespace}/MOVE_FAILED`
  ),
};

const nextTurn = {
  x: "o" as "o",
  o: "x" as "x",
};

export const turnReducer = (turn: Player, event: Event): Player => {
  if (actions.moveSucceeded.match(event)) {
    return nextTurn[event.payload.player];
  }

  return turn;
};

export const movesReducer = (moves: Move[], event: Event) => {
  if (actions.moveSucceeded.match(event)) {
    return [...moves, event.payload];
  }

  return [];
};

type Event = ReturnType<typeof actions.moveSucceeded>;
type State = Event[];

const selectors = {
  events: (state: { [namespace]: State }) => state[namespace],
  turn: (state: { [namespace]: State }) =>
    state[namespace].reduce(turnReducer, "x"),
  moves: (state: { [namespace]: State }) =>
    state[namespace].reduce(movesReducer, []),
};

const reducer = createReducer<State>([], (builder) => {
  builder.addCase(actions.moveSucceeded, (state, action) => {
    state.push(action);
  });
});

const moveLogic = (
  events: Event[],
  move: ReturnType<typeof actions.move>
):
  | ReturnType<typeof actions.moveSucceeded>
  | ReturnType<typeof actions.moveFailed> => {
  const isNotPlayersTurn =
    move.payload.player !==
    events.reduce(
      (turn, event) =>
        actions.moveSucceeded.match(event)
          ? nextTurn[event.payload.player]
          : turn,
      "x"
    );

  if (isNotPlayersTurn) {
    return actions.moveFailed({ reason: "NOT_TURN" });
  }

  const isPositionTaken = events.some(
    (event) =>
      actions.moveSucceeded.match(event) &&
      event.payload.row === move.payload.row &&
      event.payload.column === move.payload.column
  );

  if (isPositionTaken) {
    return actions.moveFailed({ reason: "POSITION_TAKEN" });
  }

  return actions.moveSucceeded(move.payload);
};

function* saga() {
  yield takeEvery(actions.clicked, function* (action) {
    const turn: ReturnType<typeof selectors.turn> = yield select(
      selectors.turn
    );

    yield put(
      actions.move({
        ...action.payload,
        player: turn,
      })
    );
  });

  yield takeEvery(actions.move, function* (action) {
    const events: ReturnType<typeof selectors.events> = yield select(
      selectors.events
    );

    const result = moveLogic(events, action);

    yield put(result);
  });
}

export const ticTacToe = {
  namespace,
  saga,
  actions,
  reducer,
  selectors,
};
