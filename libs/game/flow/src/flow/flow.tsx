import { Position } from './position';

type Node = {
  position: Position;
};

type Path = {
  position: Position;
  next?: Path;
};

export type Model = {
  id: string;
  nodes: Node[];
  paths: Path[];
};

export type Puzzle = {
  nodes: PuzzleNode[][];
  paths: { [key: string]: Path };
};

type ShorthandNode = '⬛️' | '🔴' | '🟢' | '🟡' | '🟠' | '🟣' | '🔵' | '  ';

export const puzzle: ShorthandNode[][] = [
  ['⬛️', '🔴', '  ', '🔴', '⬛️'],
  ['🔵', '  ', '🟢', '  ', '🟢'],
  ['⬛️', '  ', '  ', '  ', '🔵'],
];

type PuzzleNode =
  | {
      type: 'endpoint';
      color: string;
      position: Position;
    }
  | {
      type: 'obstacle';
      position: Position;
    };

const board = [
  ['b', 'r', 'r', 'r', 'o'],
  ['b', 'r', 'y', 'y', 'o'],
  ['b', 'r', 'y', 'o', 'o'],
  ['b', 'r', 'o', 'o', 'g'],
  ['b', 'b', 'g', 'g', 'g'],
] as const;

const letterToColor = (letter: 'b' | 'r' | 'o' | 'g' | 'y'): string => {
  switch (letter) {
    case 'b':
      return 'blue';
    case 'r':
      return 'red';
    case 'o':
      return 'orange';
    case 'g':
      return 'green';
    case 'y':
      return 'yellow';
  }
};

export const viewCoverArt = () => {
  return (
    <svg viewBox="0 0 5 5">
      <rect width="100%" height="100%" fill="black" />
      {board.map((row, y) =>
        row.map((letter, x) => {
          const fill = letterToColor(letter);

          // const north = board[y - 1]?.[x];
          // const south = board[y + 1]?.[x];
          // const east = board[y]?.[x + 1];
          // const west = board[y]?.[x - 1];

          return (
            <g key={`${x}-${y}-${fill}`} transform="translate(0.5, 0.5)">
              {/* {north && north === letter && (
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y + 1}
                  stroke={fill}
                  strokeWidth={0.1}
                /> */}
              )}
              <circle cx={x} cy={y} r={0.25} fill={fill} />
            </g>
          );
        })
      )}
    </svg>
  );
};
