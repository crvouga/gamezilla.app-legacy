export type Player = "X" | "O";

export type Slot = Player | "Empty";

export type Row = "0" | "1" | "2";

export type Column = "0" | "1" | "2";

export type Board = {
  [key in Column]: {
    [key in Row]: Slot;
  };
};

export type Position = { row: Row; column: Column };

export const toSlot = (board: Board, { column, row }: Position): Slot =>
  board[column][row];

export const setSlot = (
  board: Board,
  { column, row }: Position,
  slot: Slot
): Board => ({
  ...board,
  [column]: {
    ...board[column],
    [row]: slot,
  },
});
