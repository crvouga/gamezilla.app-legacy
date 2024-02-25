import { Flow } from "../flow"
import * as FlowHexDimensions from "./flow-hex-dimensions"

type HexPosition = {
  x: number
  y: number
  z: number
}

export type Model = Flow.Model &
  FlowHexDimensions.Model & {
    t: "flow-hex"
    FlowHex: true
    positions: Record<Flow.NodeId, HexPosition>
  }

export const init = (input: {
  dimensions: FlowHexDimensions.Model
  terminalsByGroupId: Flow.Model["terminalsByGroupId"]
}): Model => {
  return {
    ...Flow.init,
    ...input.dimensions,
    t: "flow-hex",
    FlowHex: true,
    positions: {},
  }
}

export const distance =
  (model: Model) =>
  (a: Flow.NodeId, b: Flow.NodeId): number => {
    const positionA = model.positions[a]

    if (!positionA) {
      return Infinity
    }

    const positionB = model.positions[b]

    if (!positionB) {
      return Infinity
    }

    return hexDistance(positionA, positionB)
  }

const hexDistance = (a: HexPosition, b: HexPosition): number => {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}
