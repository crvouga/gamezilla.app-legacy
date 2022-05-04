/* 


Model


*/

export type Player = "X" | "O";

export type Slot = Player | "Empty";

export type Row = "0" | "1" | "2";

export type Column = "0" | "1" | "2";

export type Board = {
  [key in Column]: {
    [key in Row]: Slot;
  };
};

type Position = { row: Row; column: Column };

const toSlot = (board: Board, { column, row }: Position): Slot =>
  board[column][row];

const setSlot = (
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

/*


View


*/
export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
};

const LINES = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
];
