import { NonNegInt } from '@gamezilla/temp-shared';

export type Position = {
  x: NonNegInt;
  y: NonNegInt;
};

const add = (a: Position, b: Position): Position => {
  return { x: NonNegInt.add(a.x, b.x), y: NonNegInt.add(a.y, b.y) };
};

const toAdjacent = (a: Position): Position[] => {
  return [
    { x: NonNegInt.floor(a.x + 1), y: a.y },
    { x: NonNegInt.floor(a.x - 1), y: a.y },
    { x: a.x, y: NonNegInt.floor(a.y + 1) },
    { x: a.x, y: NonNegInt.floor(a.y - 1) },
  ];
};

export const Position = {
  add,
  toAdjacent,
};

export type Direction = 'north' | 'south' | 'east' | 'west';
