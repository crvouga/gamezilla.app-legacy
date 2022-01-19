import { cartesianProduct } from "../utility/list";
import Integer, { IInteger } from "../utility/integer";

export type IPosition = {
  x: IInteger;
  y: IInteger;
};

const Position = (x: number, y: number): IPosition => {
  return {
    x: Integer.floor(x),
    y: Integer.floor(y),
  };
};

const add = (a: IPosition, b: IPosition) => {
  return Position(a.x + b.x, a.y + b.y);
};

const range = (lower: IPosition, upper: IPosition): IPosition[] => {
  return cartesianProduct(
    Position,
    Integer.range(lower.x, upper.x),
    Integer.range(lower.y, upper.y)
  );
};

const equals = (a: IPosition, b: IPosition): boolean => {
  return a.x === b.x && a.y === b.y;
};

export default {
  add,
  range,
  equals,
  Position,
};
