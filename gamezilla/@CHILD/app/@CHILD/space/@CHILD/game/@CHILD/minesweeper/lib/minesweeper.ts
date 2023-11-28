import { p, Random } from "gamezilla/@SHARED/core";
import { Position } from "./position";
import { PositionSet } from "./position-set";

export type Model = {
  mines: PositionSet;
  flags: PositionSet;
  holes: PositionSet;
  rowCount: number;
  columnCount: number;
};

export const toMineCount = (model: Model, position: Position): number => {
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) {
        continue;
      }

      const adjacent = Position.add(position, { x: dx, y: dy });

      if (PositionSet.has(model.mines, adjacent)) {
        count++;
      }
    }
  }

  return count;
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
    Position.range({ maxX: columnCount, maxY: rowCount }),
    (x) => Random.shuffle(seed, x),
    (x) => x.slice(0, mineCount),
    PositionSet.fromArray
  );
};

export const didLose = (model: Model) => {
  return PositionSet.size(PositionSet.intersect(model.mines, model.holes)) > 0;
};

export const didWin = (model: Model) => {
  const holeCount = PositionSet.size(model.holes);
  const mineCount = PositionSet.size(model.mines);
  const slotCount = model.rowCount * model.columnCount;
  return holeCount + mineCount === slotCount;
};

export const plantFlag = (model: Model, position: Position): Model => {
  if (PositionSet.has(model.holes, position)) {
    return model;
  }

  return {
    ...model,
    flags: PositionSet.add(model.flags, position),
  };
};

export const removeFlag = (model: Model, position: Position): Model => {
  return {
    ...model,
    flags: PositionSet.remove(model.flags, position),
  };
};

export const digHole = (model: Model, position: Position): Model => {
  if (PositionSet.has(model.flags, position)) {
    return model;
  }

  return {
    ...model,
    holes: PositionSet.add(model.holes, position),
  };
};
