import { IInteger, Integer, List } from "@libs/utility";

export type IPosition = {
  x: IInteger;
  y: IInteger;
};

const make = (x: number, y: number): IPosition => {
  return {
    x: Integer.floor(x),
    y: Integer.floor(y),
  };
};

const add = (a: IPosition, b: IPosition) => {
  return make(a.x + b.x, a.y + b.y);
};

const range = (lower: IPosition, upper: IPosition): IPosition[] => {
  return List.cartesianProduct(
    make,
    Integer.range(lower.x, upper.x),
    Integer.range(lower.y, upper.y)
  );
};

const equals = (a: IPosition, b: IPosition): boolean => {
  return a.x === b.x && a.y === b.y;
};

const ZERO = make(0, 0);

export const Position = {
  add,
  range,
  equals,
  ZERO,
};
