import { cartesianProduct } from "../utility/list";
import * as Integer from "./integer";

export type IPosition = {
  x: Integer.Integer;
  y: Integer.Integer;
};

const add = (a: IPosition, b: IPosition): IPosition => {
  return {
    x: Integer.add(a.x, b.x),
    y: Integer.add(a.y, b.y),
  };
};

const random = (lower: IPosition, upper: IPosition) => {
  return {
    x: Integer.random(lower.x, upper.x),
    y: Integer.random(lower.y, upper.y),
  };
};

const range = (lower: IPosition, upper: IPosition): IPosition[] => {
  return cartesianProduct(
    (x, y) => ({ x, y }),
    Integer.range(lower.x, upper.x),
    Integer.range(lower.y, upper.y)
  );
};

export default {
  add,
  random,
  range,
};
