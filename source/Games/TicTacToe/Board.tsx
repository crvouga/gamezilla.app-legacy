//
//
//
// Model
//
//
//

export type Player = "X" | "O";

export type Slot = Player | "Empty";

export type Row = 0 | 1 | 2;

export type Column = 0 | 1 | 2;

export type Board = {
  [key in Column]: {
    [key in Row]: Slot;
  };
};

export const emptyBoard: Board = {
  "0": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
  "1": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
  "2": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
};

export type Position = { row: Row; column: Column };

export const toSlot = (board: Board, position: Position): Slot =>
  board[position.column][position.row];

export const setSlot = (
  board: Board,
  { column, row }: Position,
  slot: Slot,
): Board => ({
  ...board,
  [column]: {
    ...board[column],
    [row]: slot,
  },
});

export const allPositions: Position[] = [
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 0, column: 2 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 2, column: 0 },
  { row: 2, column: 1 },
  { row: 2, column: 2 },
];

export const toSlots = (board: Board): Slot[] => {
  return Object.values(board).flatMap((column) => Object.values(column));
};

export const allWinningGroups: Position[][] = [
  // vertical
  [
    { row: 0, column: 0 },
    { row: 1, column: 0 },
    { row: 2, column: 0 },
  ],
  [
    { row: 0, column: 1 },
    { row: 1, column: 1 },
    { row: 2, column: 1 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 2 },
    { row: 2, column: 2 },
  ],
  // horizontal
  [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
  ],
  [
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
  ],
  [
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
  ],
  // diagonal
  [
    { row: 0, column: 0 },
    { row: 1, column: 1 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 1 },
    { row: 2, column: 0 },
  ],
];

type Winner = Player | "None";

type Wins = { X: Position[][]; O: Position[][]; None: Position[][] };

const toWins = (board: Board): Wins => {
  return allWinningGroups.reduce(
    (wins, winningGroup) => {
      const slots = winningGroup.map((position) => toSlot(board, position));

      const winner: Winner = slots.every((slot) => slot === "X")
        ? "X"
        : slots.every((slot) => slot === "O")
        ? "O"
        : "None";

      return { ...wins, [winner]: [...wins[winner], winningGroup] };
    },
    {
      X: [],
      O: [],
      None: [],
    },
  );
};

type Status =
  | { type: "Turn"; turn: Player }
  | { type: "Win"; winner: Player }
  | { type: "Tie" };

export const toStatus = (board: Board): Status => {
  const wins = toWins(board);

  if (wins.X.length > 0) {
    return { type: "Win", winner: "X" };
  }

  if (wins.O.length > 0) {
    return { type: "Win", winner: "O" };
  }

  return { type: "Turn", turn: toTurn(board) };
};

type SlotFrequency = { X: number; O: number; Empty: number };

const toSlotFrequency = (board: Board): SlotFrequency => {
  return toSlots(board).reduce(
    (frequency, slot) => ({ ...frequency, [slot]: frequency[slot] + 1 }),
    { X: 0, O: 0, Empty: 0 },
  );
};

export const toTurn = (board: Board): Player => {
  const frequency = toSlotFrequency(board);
  return frequency["X"] <= frequency["O"] ? "X" : "O";
};

export const move = (
  board: Board,
  player: Player,
  position: Position,
): Board => {
  const status = toStatus(board);

  if (
    status.type === "Turn" &&
    status.turn === player &&
    toSlot(board, position) === "Empty"
  ) {
    return setSlot(board, position, player);
  }

  return board;
};
