import { P1 } from "gamezilla-app/@SHARED/parsing"
import { FlowParser } from "../../flow"
import * as FlowGrid from "./flow-grid"
import { Position } from "./flow-grid-position"

const toPositions = (x: unknown): FlowGrid.Model["positions"] | null => {
  if (P1.dict(P1.str, Position.is)(x)) {
    return x
  }
  return null
}

const isPositions = P1.is(toPositions)

const to = (x: unknown): FlowGrid.Model | null => {
  if (
    P1.obj(x) &&
    P1.has(x, "t", P1.literal("flow-grid")) &&
    P1.has(x, "width", P1.num) &&
    P1.has(x, "height", P1.num) &&
    P1.has(x, "positions", isPositions) &&
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

const is = P1.is(to)

export const FlowGridParser = {
  is,
  to,
}
