import { createAction } from "@reduxjs/toolkit";
import { InferActionUnion } from "../../utils";

type IPlayer = "PlayerOne" | "PlayerTwo";

type ISlot = IPlayer | "Empty";

type IColumn = ISlot[];

type IColumns = IColumn[];

type IColumnIndex = number & { type: "ColumnIndex" };

const MAX_COLUMN_HEIGHT = 7;

const move = (
  columns: IColumns,
  columnIndex: IColumnIndex,
  player: IPlayer
): IColumns => {
  return columns.map((column, index) => {
    if (index === columnIndex) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT);
    }

    return column;
  });
};

const toSlot = (
  columns: IColumns,
  { x, y }: { x: number; y: number }
): ISlot => {
  const slot = columns?.[x]?.[y];

  if (slot) {
    return slot;
  }

  return "Empty";
};

const isEven = (x: number) => x % 2 === 0;

export const toTurn = (columns: IColumns): IPlayer => {
  return isEven(columns.flat().filter((slot) => slot === "PlayerOne").length)
    ? "PlayerOne"
    : "PlayerTwo";
};

type IStatus =
  | {
      type: "Playing";
    }
  | {
      type: "Winner";
      winner: IPlayer;
    }
  | {
      type: "Tie";
    };

function* generateConnection(
  columns: IColumns,
  slot: ISlot,
  [x, y]: readonly [number, number]
) {}

type IPosition = {
  x: number;
  y: number;
};

type IDirection = {
  dx: number;
  dy: number;
};

function* yieldAllPositionsAndDirections(columns: IColumns) {
  for (let x = 0; x <= columns.length; x++) {
    for (let y = 0; y <= columns[x].length; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= dy; dx++) {
          yield {
            x,
            y,
            dx,
            dy,
          };
        }
      }
    }
  }
}

function* yieldLine({
  columns,
  x,
  y,
  dx,
  dy,
}: {
  columns: IColumns;
  x: number;
  y: number;
  dx: number;
  dy: number;
}) {
  while (true) {
    const adjancentPosition = {
      x: x + dx,
      y: y + dy,
    };

    const slot = toSlot(columns, { x, y });

    const adjancentSlot = toSlot(columns, adjancentPosition);

    if (adjancentSlot === slot) {
      yield adjancentPosition;
    } else {
      break;
    }
  }
}

function* yieldLines(
  columns: IColumns,
  { minimumLength }: { minimumLength: number }
) {
  const visited = new Set();

  for (const { x, y, dx, dy } of yieldAllPositionsAndDirections(columns)) {
    const key = `${x}${y}${dx}${dy}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const line = Array.from(yieldLine({ columns, x, y, dx, dy }));

    if (line.length >= minimumLength) {
      yield line;
    }
  }
}

export const toStatus = (columns: IColumns): IStatus => {
  const winningLines = Array.from(yieldLines(columns, { minimumLength: 5 }));

  if (winningLines.length > 0) {
    const winner = toSlot(columns, winningLines[0][0]);

    if (winner === "Empty") {
      return {
        type: "Playing",
      };
    }

    return {
      type: "Winner",
      winner,
    };
  }

  return {
    type: "Playing",
  };
};

/*


State


*/

type IState = {
  columns: IColumns;
};

/*


Actions


*/

const actions = {
  moved: createAction(
    "connect-four/MOVED",
    (columnIndex: IColumnIndex, player: IPlayer) => ({
      payload: {
        columnIndex,
        player,
      },
    })
  ),
};

type IAction = InferActionUnion<typeof actions>;

/*


Reducer


*/

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "connect-four/MOVED":
      const { columnIndex, player } = action.payload;

      return {
        ...state,
        columns: move(state.columns, columnIndex, player),
      };
  }
};

/*





*/
