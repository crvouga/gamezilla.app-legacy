import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { equals, mapValues } from "../../utils";
import { InferActionUnion } from "../../utils/action-creator";

export type IPlayer = "X" | "O";

export type ISlot = IPlayer | "Empty";

export type IRow = "0" | "1" | "2";

export type IColumn = "0" | "1" | "2";

export type IBoard = {
  [key in IColumn]: {
    [key in IRow]: ISlot;
  };
};

export type IPosition = readonly [IColumn, IRow];

const getSlot = (board: IBoard, [column, row]: IPosition): ISlot =>
  board[column][row];

const setSlot = (
  board: IBoard,
  [column, row]: IPosition,
  slot: ISlot
): IBoard => ({
  ...board,
  [column]: {
    ...board[column],
    [row]: slot,
  },
});

export const allPositions: IPosition[] = (["0", "1", "2"] as const).flatMap(
  (column: IColumn) =>
    (["0", "1", "2"] as const).map((row: IRow) => [column, row] as const)
);

const emptyBoard: IBoard = {
  0: {
    0: "Empty",
    1: "Empty",
    2: "Empty",
  },
  1: {
    0: "Empty",
    1: "Empty",
    2: "Empty",
  },
  2: {
    0: "Empty",
    1: "Empty",
    2: "Empty",
  },
};

export const actions = {
  restart: createAction("tic-tac-toe/RESTART"),

  moved: createAction(
    "tic-tac-toe/MOVED",
    (position: IPosition, player: IPlayer) => ({
      payload: {
        position,
        player,
      },
    })
  ),

  boardPressed: createAction(
    "tic-tac-toe/BOARD_PRESSED",
    (position: IPosition) => ({ payload: position })
  ),
};

export type IAction = InferActionUnion<typeof actions>;

export const mapBoard = (
  board: IBoard,
  f: (a: ISlot, column: IColumn, row: IRow) => ISlot
): IBoard =>
  mapValues(board, (column, x) =>
    mapValues(column, (slot, y) => f(slot, x, y))
  );

export const canRestart = (board: IBoard) => {
  return !equals(board, emptyBoard);
};

export const boardReducer = (board: IBoard, action: IAction): IBoard => {
  switch (action.type) {
    case "tic-tac-toe/RESTART":
      return emptyBoard;

    case "tic-tac-toe/BOARD_PRESSED":
      return board;

    case "tic-tac-toe/MOVED":
      const { position, player } = action.payload;

      if (
        getSlot(board, position) === "Empty" &&
        toStatus(board).type === "Turn"
      ) {
        return setSlot(board, position, player);
      }

      return board;
  }
};

export type IState = {
  board: IBoard;
  playerTypes: {
    [player in IPlayer]:
      | { type: "None" }
      | { type: "User"; userId: string }
      | { type: "Computer"; difficulty: "Easy" | "Medium" | "Impossible" };
  };
};

const isEven = (x: number) => x % 2 === 0;

const boardToTurn = (board: IBoard): IPlayer => {
  const slots = Object.values(board).flatMap((_) => Object.values(_));

  const emptySlots = slots.filter((slot) => slot === "Empty");

  return isEven(emptySlots.length) ? "O" : "X";
};

type IWin = [IPosition, IPosition, IPosition];

const ALL_POSSIBLE_WINS: IWin[] = [
  // |
  [
    ["0", "0"],
    ["0", "1"],
    ["0", "2"],
  ],
  [
    ["1", "0"],
    ["1", "1"],
    ["1", "2"],
  ],
  [
    ["2", "0"],
    ["2", "1"],
    ["2", "2"],
  ],
  // -
  [
    ["0", "0"],
    ["1", "0"],
    ["2", "0"],
  ],
  [
    ["0", "1"],
    ["1", "1"],
    ["2", "1"],
  ],
  [
    ["0", "2"],
    ["1", "2"],
    ["2", "2"],
  ],
  // \
  [
    ["0", "0"],
    ["1", "1"],
    ["2", "2"],
  ],
  // /
  [
    ["0", "2"],
    ["1", "1"],
    ["2", "0"],
  ],
];

const isWin = (board: IBoard, possibleWin: IWin) => {
  const slots = possibleWin
    .map((position) => getSlot(board, position))
    .filter((slot) => slot !== "Empty");

  return new Set(slots).size === 1 && slots.length == 3;
};

const toWins = (board: IBoard) => {
  return ALL_POSSIBLE_WINS.filter((possibleWin) => isWin(board, possibleWin));
};

const toWinner = (board: IBoard) => {
  const wins = toWins(board);

  if (wins.length === 0) {
    return "None";
  }

  const arbitraryPosition = wins[0][0];

  const slot = getSlot(board, arbitraryPosition);

  if (slot === "Empty") {
    return "None";
  }

  return slot;
};

const toStatus = (board: IBoard) => {
  const winner = toWinner(board);

  if (winner !== "None") {
    return {
      type: "Winner",
      player: winner,
    } as const;
  }

  const turn = boardToTurn(board);

  return { type: "Turn", player: turn } as const;
};

export const initialState: IState = {
  board: emptyBoard,

  playerTypes: {
    X: {
      type: "None",
    },
    O: {
      type: "None",
    },
  },
};

export const toStatusText = (board: IBoard) => {
  const status = toStatus(board);
  switch (status.type) {
    case "Turn":
      return `${status.player}'s turn`;

    case "Winner":
      return `${status.player}'s won`;
  }
};

export const reducer = (state: IState, action: IAction): IState => ({
  ...state,
  board: boardReducer(state.board, action),
});

export function* saga({ selector }: { selector: (_: unknown) => IState }) {
  yield takeEvery(actions.boardPressed, function* (action) {
    const state: IState = yield select(selector);

    const turn = boardToTurn(state.board);

    yield put(actions.moved(action.payload, turn));
  });
}
