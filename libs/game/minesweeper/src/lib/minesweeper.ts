import { p, shuffle } from '@gamezilla/core';

export type Model = {
  mines: PositionSet;
  flags: PositionSet;
  holes: PositionSet;
};

type PositionSet = {
  [key: string]: Position;
};

const fromArray = (array: Position[]): PositionSet => {
  const set: PositionSet = {};
  for (const position of array) {
    set[toKey(position)] = position;
  }
  return set;
};

type Position = {
  x: number;
  y: number;
};

export const toKey = (position: Position) => {
  return `${position.x},${position.y}`;
};

const has = (set: PositionSet, position: Position): boolean => {
  return Boolean(set[toKey(position)]);
};

export const toMineCount = (model: Model, position: Position) => {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const adjacent: Position = {
        x: position.x + dx,
        y: position.y + dy,
      };
      if (has(model.mines, adjacent)) {
        count++;
      }
    }
  }
  return count;
};

export const toAllPositions = ({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}): Position[] => {
  const positions: Position[] = [];
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      positions.push({ x, y });
    }
  }
  return positions;
};

export const initMines = ({
  rowCount,
  columnCount,
  mineCount,
  seed,
}: {
  rowCount: number;
  columnCount: number;
  mineCount: number;
  seed: string;
}): PositionSet => {
  return p(
    toAllPositions({ rowCount, columnCount }),
    (x) => shuffle(seed, x),
    (x) => x.slice(0, mineCount),
    fromArray
  );
};
