import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { mapValues } from "../../utils";
import { InferActionUnion } from "../../utils/action-creator";

type IPlayer = "X" | "O";

type ISlot = IPlayer | "Empty";

export type IRow = "0" | "1" | "2";

export type IColumn = "0" | "1" | "2";

export type IBoard = {
  [key in IColumn]: {
    [key in IRow]: ISlot;
  };
};

export type IPosition = {
  row: IRow;
  column: IColumn;
};

export const allPositions: IPosition[] = (["0", "1", "2"] as const).flatMap(
  (row) => (["0", "1", "2"] as const).map((column) => ({ row, column }))
);

export const toWinPositionSets = (_board: IBoard) => {
  return [];
};

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
  moved: createAction<
    { row: IRow; column: IColumn; player: IPlayer },
    "tic-tac-toe/MOVED"
  >("tic-tac-toe/MOVED"),

  boardPressed: createAction<
    { row: IRow; column: IColumn },
    "tic-tac-toe/BOARD_PRESSED"
  >("tic-tac-toe/BOARD_PRESSED"),
};

export type IAction = InferActionUnion<typeof actions>;

export const mapBoard = (
  board: IBoard,
  f: (a: ISlot, column: IPosition["column"], row: IPosition["row"]) => ISlot
): IBoard =>
  mapValues(board, (column, x) =>
    mapValues(column, (slot, y) => f(slot, x, y))
  );

export const boardReducer = (board: IBoard, action: IAction): IBoard => {
  switch (action.type) {
    case "tic-tac-toe/BOARD_PRESSED":
      return board;

    case "tic-tac-toe/MOVED":
      const { column, row, player } = action.payload;
      return {
        ...board,
        [column]: {
          ...board[column],
          [row]: player,
        },
      };
  }
};

export type IState = {
  board: IBoard;
  playerTypes: {
    [player in IPlayer]: { type: "Local" } | { type: "Computer" };
  };
};

const isEven = (x: number) => x % 2 === 0;

const boardToTurn = (board: IBoard): IPlayer => {
  const slots = Object.values(board).flatMap((_) => Object.values(_));

  const emptySlots = slots.filter((slot) => slot === "Empty");

  return isEven(emptySlots.length) ? "O" : "X";
};

export const initialState: IState = {
  board: emptyBoard,

  playerTypes: {
    X: {
      type: "Local",
    },
    O: {
      type: "Local",
    },
  },
};

export const toStatus = ({ board }: { board: IBoard }) => {
  const turn = boardToTurn(board);

  return `${turn}'s turn`;
};

export const reducer = (state: IState, action: IAction): IState => ({
  ...state,
  board: boardReducer(state.board, action),
});

export function* saga({ selector }: { selector: (_: unknown) => IState }) {
  yield takeEvery(actions.boardPressed, function* (action) {
    const state: IState = yield select(selector);

    const turn = boardToTurn(state.board);

    if (state.board[action.payload.column][action.payload.row] === "Empty") {
      yield put(
        actions.moved({
          ...action.payload,
          player: turn,
        })
      );
    }
  });
}
