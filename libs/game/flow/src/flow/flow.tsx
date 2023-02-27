import { Direction, Position } from './position';

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

export const viewCoverArt = () => {
  return (
    <svg viewBox="0 0 4 4">
      <rect width="100%" height="100%" fill="black" />
      <line stroke="#343434" x1={1} y1={0} x2={1} y2={4} />
    </svg>
  );
};
