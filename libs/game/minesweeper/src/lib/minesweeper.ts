export type Model = {
  mines: PositionSet;
  flags: PositionSet;
  holes: PositionSet;
  mineCount: number;
  rowCount: number;
  columnCount: number;
};

type PositionSet = {
  [key: string]: Position;
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

export const initMines = (model: Model): Model => {
  return {
    ...model,
    mines: {},
  };
};
