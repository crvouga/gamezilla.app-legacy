import { Err, Ok, Result, eq, isSubset, unique } from "gamezilla/@SHARED/core";

//
//
//
//  Model
//
//
//

export type PlayerType = "player-one" | "player-two";

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  "player-one": "player-one",
  "player-two": "player-two",
};

export const opposite: { [playerType in PlayerType]: PlayerType } = {
  "player-one": "player-two",
  "player-two": "player-one",
};

type Color = "Red" | "Yellow";

export const playerTypeToColor: { [key in PlayerType]: Color } = {
  "player-one": "Red",
  "player-two": "Yellow",
};

export type Column = readonly PlayerType[];

export type Columns = Column[];

export const MAX_COLUMN_HEIGHT = 6;

export const emptyColumns: Columns = [[], [], [], [], [], [], []];
export const COLUMN_COUNT = emptyColumns.length;

export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const allColumnIndexes: ColumnIndex[] = [0, 1, 2, 3, 4, 5, 6];

export const allPositions: { x: number; y: number }[] = [];
for (let x = 0; x < COLUMN_COUNT; x++) {
  for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
    allPositions.push({ x: x, y: y });
  }
}

export const isColumnIndex = (index: unknown): index is ColumnIndex => {
  return (
    typeof index === "number" &&
    (index === 0 ||
      index === 1 ||
      index === 2 ||
      index === 3 ||
      index === 4 ||
      index === 5 ||
      index === 6)
  );
};

export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type MoveProblem =
  | "game_over_winner"
  | "game_over_tie"
  | "not_turn"
  | "column_is_full"
  | "out_of_bounds";

export type MoveResult = Result<MoveProblem, Columns>;

export const move = (
  columns: Columns,
  columnIndex: number,
  player: PlayerType
): MoveResult => {
  const status = toStatus(columns);

  if (status.type === "Winner") {
    return Err("game_over_winner");
  }

  if (status.type === "Tie") {
    return Err("game_over_tie");
  }

  const turn = status.turn;

  if (turn !== player) {
    return Err("not_turn");
  }

  const column = columns[columnIndex];

  if (!column) {
    return Err("out_of_bounds");
  }

  if (column.length === MAX_COLUMN_HEIGHT) {
    return Err("column_is_full");
  }

  const columnsNew = columns.map((column, index) => {
    if (index === columnIndex) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT);
    }
    return column;
  });

  return Ok(columnsNew);
};

export function isGameOver(columns: Columns): boolean {
  return toStatus(columns).type !== "Playing";
}

export const toSlot = (
  columns: Columns,
  { x, y }: { x: number; y: number }
): PlayerType | "Empty" => {
  const slot = columns?.[x]?.[y];

  if (slot) {
    return slot;
  }

  return "Empty";
};

export const toTurn = (columns: Columns): PlayerType => {
  return columns.flat().length % 2 === 0 ? "player-one" : "player-two";
};

const isFull = (columns: Columns) => {
  return columns.flat().length >= MAX_COLUMN_HEIGHT * COLUMN_COUNT;
};

export type Status =
  | {
      type: "Playing";
      turn: PlayerType;
    }
  | {
      type: "Winner";
      winner: PlayerType;
    }
  | {
      type: "Tie";
    };

export const toStatus = (columns: Columns): Status => {
  const wins = toWins(columns);
  const turn = toTurn(columns);
  const [win] = wins;

  if (win) {
    const [position] = win;

    if (!position) {
      return {
        type: "Playing",
        turn,
      };
    }

    const winner = toSlot(columns, position);

    if (winner === "Empty") {
      return {
        type: "Playing",
        turn,
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
    turn,
  };
};

//
//
//
// Wins
//
//
//

export type Pos2 = { x: number; y: number };

const toKey = ({
  x,
  y,
  dx,
  dy,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
}): string => {
  return `${x}, ${y}, ${dx}, ${dy}`;
};

export const minWinLength = 4;

const directions: [number, number][] = [
  // horizontal
  [1, 0],
  [-1, 0],
  // vertical
  [0, 1],
  [0, -1],
  // right diagonal
  [1, 1],
  [-1, -1],
  // left diagonal
  [1, -1],
  [-1, 1],
];

export type Win = [Pos2, Pos2, Pos2, Pos2, ...Pos2[]];

export const winToId = (win: Win) => win.map((x) => `${x.x},${x.y}`).join(" ");

export const toWins = (columns: Columns): Win[] => {
  const wins: Win[] = [];

  const visited = new Set<string>();

  for (let x = 0; x < columns.length; x++) {
    const column = columns[x];

    if (!column) {
      continue;
    }

    for (let y = 0; y < column.length; y++) {
      for (const [dx, dy] of directions) {
        if (visited.has(toKey({ x, y, dx, dy }))) {
          continue;
        }

        const targetSlot = column[y];

        if (!targetSlot) {
          continue;
        }

        const win: Pos2[] = [];

        let position = { x, y };

        while (toSlot(columns, position) === targetSlot) {
          visited.add(toKey({ x: position.x, y: position.y, dx, dy }));

          win.push(position);

          position = { x: position.x + dx, y: position.y + dy };
        }

        if (isWin(win)) {
          wins.push(win);
        }
      }
    }
  }

  return unique(isSameWin, wins);
};

const isWin = (positions: Pos2[]): positions is Win => {
  return positions.length >= minWinLength;
};

const isSameWin = (a: Win, b: Win) => isSubset(eq, a, b) && isSubset(eq, b, a);
