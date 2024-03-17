import { P } from "gamezilla-app/@SHARED/parsing"
import { FlowParser } from "../../flow"
import * as FlowGrid from "./flow-grid"
import { Position } from "./flow-grid-position"

const toPositions = (x: unknown): FlowGrid.Model["positions"] | null => {
  if (P.dict(P.str, Position.is)(x)) {
    return x
  }
  return null
}

const isPositions = P.is(toPositions)

const to = (x: unknown): FlowGrid.Model | null => {
  if (
    P.obj(x) &&
    P.has(x, "t", P.literal("flow-grid")) &&
    P.has(x, "width", P.num) &&
    P.has(x, "height", P.num) &&
    P.has(x, "positions", isPositions) &&
    FlowParser.isModel(x)
  ) {
    return {
      ...x,
      t: x.t,
      height: x.height,
      positions: x.positions,
      width: x.width,
    }
  }

  return null
}

const is = P.is(to)

export const FlowGridParser = {
  is,
  to,
}
