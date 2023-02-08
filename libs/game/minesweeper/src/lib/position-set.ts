import { Position } from './position';

export type PositionSet = {
  [key: string]: Position;
};

const toKey = (position: Position) => {
  return `${position.x},${position.y}`;
};

const fromArray = (array: Position[]): PositionSet => {
  const set: PositionSet = {};
  for (const position of array) {
    set[toKey(position)] = position;
  }
  return set;
};

const add = (set: PositionSet, position: Position): PositionSet => {
  return {
    ...set,
    [toKey(position)]: position,
  };
};

const remove = (set: PositionSet, position: Position): PositionSet => {
  const newSet = { ...set };
  delete newSet[toKey(position)];
  return newSet;
};

const has = (set: PositionSet, position: Position): boolean => {
  return !!set[toKey(position)];
};

export const PositionSet = {
  fromArray,
  add,
  remove,
  has,
};
