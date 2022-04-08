import { createAction } from "@reduxjs/toolkit";
import { equals, mapValues, minimax } from "../../utils";
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

const toSlot = (board: IBoard, [column, row]: IPosition): ISlot =>
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

export const ALL_POSSIBLE_POSITIONS: IPosition[] = (
  ["0", "1", "2"] as const
).flatMap((column: IColumn) =>
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

const move = (board: IBoard, position: IPosition, player: IPlayer) => {
  if (
    toSlot(board, position) === "Empty" &&
    toStatus(board).type !== "Win" &&
    toStatus(board).type !== "Tie" &&
    toTurn(board) === player
  ) {
    return setSlot(board, position, player);
  }

  return board;
};

export type IState = {
  board: IBoard;
  playerTypes: {
    [player in IPlayer]:
      | { type: "None" }
      | { type: "Local" }
      | { type: "Computer" };
  };
};

const isEven = (x: number) => x % 2 === 0;

export const toTurn = (board: IBoard): IPlayer => {
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
    .map((position) => toSlot(board, position))
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

  const slot = toSlot(board, arbitraryPosition);

  if (slot === "Empty") {
    return "None";
  }

  return slot;
};

const isBoardFull = (board: IBoard) => {
  return Object.values(board)
    .flatMap((column) => Object.values(column))
    .every((slot) => slot !== "Empty");
};

export const toStatus = (board: IBoard) => {
  if (equals(board, emptyBoard)) {
    return {
      type: "Initial",
    } as const;
  }

  const winner = toWinner(board);

  if (winner !== "None") {
    return {
      type: "Win",
      winner,
    } as const;
  }

  if (isBoardFull(board)) {
    return {
      type: "Tie",
    } as const;
  }

  return {
    type: "Playing",
  } as const;
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

export const reducer = (state: IState, action: IAction): IState => {
  if (actions.restart.match(action)) {
    return {
      ...state,
      board: emptyBoard,
    };
  }

  if (actions.boardPressed.match(action)) {
    const turn = toTurn(state.board);

    if (state.playerTypes[turn].type === "Local") {
      return {
        ...state,
        board: move(state.board, action.payload, turn),
      };
    }
  }

  return state;
};

/* 


Middlware


*/

export function* saga() {}

/*


Bot


*/

const toEmptyPositions = (board: IBoard): IPosition[] => {
  return ALL_POSSIBLE_POSITIONS.filter(
    (position) => toSlot(board, position) === "Empty"
  );
};

const toChildren = async (board: IBoard) => {
  const emptyPositions = toEmptyPositions(board);
  const turn = toTurn(board);
  return emptyPositions.map((position) => move(board, position, turn));
};

const isTerminal = async (board: IBoard) => {
  const status = toStatus(board);

  return status.type === "Tie" || status.type === "Win";
};

const toScore = (player: IPlayer) => async (board: IBoard) => {
  const winner = toWinner(board);

  if (winner === "None") {
    return 0;
  }

  if (winner === player) {
    return Infinity;
  }

  return -Infinity;
};

const reduceP = async <TY, TX>(
  reducer: (y: TY, x: TX) => Promise<TY> | TY,
  y0: TY,
  xs: TX[]
): Promise<TY> => {
  let y = y0;

  for (const x of xs) {
    y = await reducer(y, x);
  }

  return y;
};

const maxByP = async <TX>(
  keyFn: (x: TX) => Promise<number>,
  x1: TX,
  x2: TX
): Promise<TX> => {
  if ((await keyFn(x1)) >= (await keyFn(x2))) {
    return x1;
  }

  return x2;
};

const toBestMove = async (board: IBoard, player: IPlayer) => {
  const config = {
    toChildren,
    toScore: toScore(player),
    isTerminal,
  };

  return reduceP<IPosition | null, IPosition>(
    (best, position) =>
      best
        ? maxByP(
            (position) =>
              minimax(config, move(board, position, player), 3, "max"),
            best,
            position
          )
        : position,
    null,
    toEmptyPositions(board)
  );
};
