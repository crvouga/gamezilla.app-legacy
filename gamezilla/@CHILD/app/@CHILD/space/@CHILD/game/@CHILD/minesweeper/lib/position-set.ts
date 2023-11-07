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
  return Boolean(set[toKey(position)]);
};

const intersect = (a: PositionSet, b: PositionSet): PositionSet => {
  const intersection: PositionSet = {};
  for (const keyA in a) {
    const valueA = a[keyA];
    const valueB = b[keyA];
    if (valueA && valueB) {
      intersection[keyA] = valueA;
    }
  }
  return intersection;
};

const size = (set: PositionSet): number => {
  return Object.keys(set).length;
};

export const PositionSet = {
  fromArray,
  add,
  remove,
  has,
  intersect,
  size,
};
