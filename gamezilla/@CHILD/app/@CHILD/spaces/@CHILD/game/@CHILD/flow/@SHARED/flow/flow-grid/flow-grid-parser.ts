import { P } from "gamezilla/@SHARED/parsing";
import { Model } from "./flow-grid";
import * as FlowParser from "../flow-parser";
import { Position } from "./flow-grid-position";

const toPositions = (x: unknown): Model["positions"] | null => {
  if (P.dict(x, P.str, Position.is)) {
    return x;
  }
  return null;
};

const isPositions = P.is(toPositions);

export const toModel = (x: unknown): Model | null => {
  if (
    P.obj(x) &&
    P.has(x, "flow", FlowParser.isModel) &&
    P.has(x, "width", P.num) &&
    P.has(x, "height", P.num) &&
    P.has(x, "positions", isPositions)
  ) {
    return {
      type: "flow-grid",
      flow: x.flow,
      height: x.height,
      positions: x.positions,
      width: x.width,
    };
  }
  return null;
};
