import * as React from "react";

/* 



Columns


*/

export type IPlayer = "PlayerOne" | "PlayerTwo";

export type IColumn = readonly IPlayer[];

export type IColumns = readonly IColumn[];

export const MAX_COLUMN_HEIGHT = 6;

export const COLUMN_COUNT = 7;

export const emptyColumns: IColumns = [...Array(COLUMN_COUNT)].map(() => []);

export const move = (
  columns: IColumns,
  columnIndex: number,
  player: IPlayer
): IColumns => {
  return columns.map((column, index) => {
    if (index === columnIndex && toTurn(columns) === player) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT);
    }

    return column;
  });
};

export const toSlot = (
  columns: IColumns,
  { x, y }: { x: number; y: number }
): IPlayer | "Empty" => {
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
Check win
*/

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

/* 


View


*/

export const theme = {
  primary: {
    light: "#1976D2",
    dark: "#2195F2",
    darker: "#0D47A1",
  },
  playerOne: {
    light: "#FFB74D",
    dark: "#FFA623",
  },
  playerTwo: {
    light: "#F24237",
    dark: "#DB332F",
  },
};

export const Icon = () => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holemask: "holemask",
  };

  const playerOneFill = `url(#${ids.playerOneGradient})`;
  const playerTwoFill = `url(#${ids.playerTwoGradient})`;

  return (
    <svg width="100%" viewBox={"0 0 2 2"}>
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
        </pattern>

        <mask id={ids.holemask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={theme.primary.light} />
          <stop offset="100%" stopColor={theme.primary.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerOne.light} />
          <stop offset="100%" stopColor={theme.playerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerTwo.light} />
          <stop offset="100%" stopColor={theme.playerTwo.dark} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={2} height={2} fill={theme.primary.darker} />

      <circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

      <circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

      <circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

      <circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holemask})`}
      />
    </svg>
  );
};
