import { Button } from "@mui/material";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import React from "react";
import * as View from "../View";

//
//
//
// Board
//
//
//

export type Player = "X" | "O";

export type Slot = Player | "Empty";

export type Row = "0" | "1" | "2";

export type Column = "0" | "1" | "2";

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

const allPositions: Position[] = [
  { row: "0", column: "0" },
  { row: "0", column: "1" },
  { row: "0", column: "2" },
  { row: "1", column: "0" },
  { row: "1", column: "1" },
  { row: "1", column: "2" },
  { row: "2", column: "0" },
  { row: "2", column: "1" },
  { row: "2", column: "2" },
];

export const toSlots = (board: Board): Slot[] => {
  return Object.values(board).flatMap((column) => Object.values(column));
};

export const toTurn = (board: Board): Player => {
  const slots = toSlots(board);
  const xSlots = slots.filter((slot) => slot === "X");
  const oSlots = slots.filter((slot) => slot === "O");

  if (xSlots.length <= oSlots.length) {
    return "X";
  }

  return "O";
};

export const move = (
  board: Board,
  player: Player,
  position: Position
): Board => {
  const turn = toTurn(board);

  if (turn === player && toSlot(board, position) === "Empty") {
    return setSlot(board, position, player);
  }

  return board;
};

//
//
//
// View
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
};

const Slot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: Slot;
  r: number;
  cx: number;
  cy: number;
}) => {
  return {
    Empty: () => <g></g>,
    X: () => Cross({ r, cx, cy }),
    O: () => Naught({ r, cx, cy }),
  }[slot]();
};

const Cross = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <g strokeWidth={0.1} stroke={theme.cross}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  );
};

const Naught = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={theme.naught}
      strokeWidth={0.1}
      fill="transparent"
    />
  );
};

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
];

export const Board = ({
  board,
  onClick,
}: {
  board: Board;
  onClick: (position: Position) => void;
}) => {
  return (
    <svg width={"100%"} viewBox="0 0 3 3">
      <rect width="100%" height="100%" fill={theme.background} />
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}
      {allPositions.map((position) => (
        <Slot
          key={[position.column, position.row, toSlot(board, position)].join(
            " "
          )}
          slot={toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {allPositions.map((position) => (
        <rect
          key={[position.column, position.row, toSlot(board, position)].join(
            " "
          )}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  );
};

export const Icon = () => {
  const positions: [Position, Slot][] = [
    [{ row: "0", column: "0" }, "X"],
    [{ row: "0", column: "1" }, "Empty"],
    [{ row: "1", column: "0" }, "Empty"],
    [{ row: "1", column: "1" }, "O"],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" height="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={theme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={theme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <Slot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};

//
//
//
// Model
//
//
//

export type Model = {
  board: Board;
};

export const init: Model = {
  board: emptyBoard,
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedBoard"; position: Position }
  | { type: "UserClickedRestartButton" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, navigation.back()];

    case "UserClickedRestartButton":
      return [
        {
          ...model,
          board: emptyBoard,
        },
        cmd.none,
      ];

    case "UserClickedBoard":
      return [
        {
          ...model,
          board: move(model.board, toTurn(model.board), msg.position),
        },
        cmd.none,
      ];
  }
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Tic Tac Toe"
        />
        <Board
          board={model.board}
          onClick={(position) =>
            dispatch({ type: "UserClickedBoard", position })
          }
        />

        <Button
          size="large"
          fullWidth
          onClick={() => dispatch({ type: "UserClickedRestartButton" })}
        >
          Restart
        </Button>
      </View.Page>
    );
