import { p, shuffle } from '@gamezilla/core';
import { Position } from './position';
import { PositionSet } from './position-set';

export type Model = {
  mines: PositionSet;
  flags: PositionSet;
  holes: PositionSet;
};

const deltas = [
  { x: -1, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
];

export const toMineCount = (model: Model, position: Position): number => {
  return deltas
    .map((delta) => Position.add(position, delta))
    .filter((adjacent) => PositionSet.has(model.mines, adjacent)).length;
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
    (x) => shuffle(seed, x),
    (x) => x.slice(0, mineCount),
    PositionSet.fromArray
  );
};

export const plantFlag = (model: Model, position: Position): Model => {
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
