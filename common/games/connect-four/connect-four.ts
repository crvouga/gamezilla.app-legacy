import { createAction } from "@reduxjs/toolkit";
import { InferActionUnion } from "../../utils";

type IPlayer = "PlayerOne" | "PlayerTwo";

export type ISlot = IPlayer | "Empty";

type IColumn = ISlot[];

type IColumns = IColumn[];

type IColumnIndex = number & { type: "ColumnIndex" };

export const MAX_COLUMN_HEIGHT = 6;
export const COLUMN_COUNT = 7;

const EMPTY_COLUMNS: IColumns = [...Array(COLUMN_COUNT)].map(() => []);

const move = (
  columns: IColumns,
  columnIndex: number,
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
  return isEven(columns.flat().length) ? "PlayerTwo" : "PlayerOne";
};

const isFull = (columns: IColumns) => {
  return columns.flat().length >= MAX_COLUMN_HEIGHT * COLUMN_COUNT;
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

function* yieldPositionsAndDirections(columns: IColumns) {
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
  yield {
    x,
    y,
  };

  while (true) {
    const adjancentPosition = {
      x: x + dx,
      y: y + dy,
    };

    const adjancentSlot = toSlot(columns, adjancentPosition);

    const slot = toSlot(columns, { x, y });

    if (adjancentSlot === slot) {
      yield adjancentPosition;
    } else {
      break;
    }
  }
}

function* yieldLines(columns: IColumns) {
  const visited = new Set();

  for (const { x, y, dx, dy } of yieldPositionsAndDirections(columns)) {
    const key = `${x}${y}${dx}${dy}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const line = Array.from(yieldLine({ columns, x, y, dx, dy }));

    yield line;
  }
}

function* filter<T>(predicate: (item: T) => boolean, generator: Generator<T>) {
  for (const item of generator) {
    if (predicate(item)) {
      yield item;
    }
  }
}

export const toStatus = (columns: IColumns): IStatus => {
  const winningLines = Array.from(
    filter((line) => line.length >= 5, yieldLines(columns))
  );

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

  if (isFull(columns)) {
    return {
      type: "Tie",
    };
  }

  return {
    type: "Playing",
  };
};

/*


State


*/

export type IState = {
  columns: IColumns;
};

export const initialState: IState = {
  columns: EMPTY_COLUMNS,
};

/*


Actions


*/

export const actions = {
  columnsCleared: createAction("connect-four/COLUMNS_CLEARED"),

  columnPressed: createAction(
    "connect-four/COLUMN_PRESSED",
    (columnIndex: number) => ({
      payload: {
        columnIndex,
      },
    })
  ),
};

export type IAction = InferActionUnion<typeof actions>;

/*


Reducer


*/

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "connect-four/COLUMNS_CLEARED":
      return {
        ...state,
        columns: EMPTY_COLUMNS,
      };

    case "connect-four/COLUMN_PRESSED":
      const { columnIndex } = action.payload;

      const turn = toTurn(state.columns);

      return {
        ...state,
        columns: move(state.columns, columnIndex, turn),
      };
  }
};

/*





*/
export function* saga() {}
