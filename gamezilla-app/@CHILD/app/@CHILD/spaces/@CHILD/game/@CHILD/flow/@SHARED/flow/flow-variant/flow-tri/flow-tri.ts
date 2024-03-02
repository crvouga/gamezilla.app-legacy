import { Flow } from "../../flow"
import * as FlowTriDimensions from "./flow-tri-dimensions"

export type Model = Flow.Model &
  FlowTriDimensions.Model & {
    t: "flow-tri"
    FlowTri: true
  }

export const init = (input: {
  dimensions: FlowTriDimensions.Model
  terminalsByGroupId: Flow.Model["terminalsByGroupId"]
}): Model => {
  return {
    ...Flow.init,
    ...input.dimensions,
    t: "flow-tri",
    FlowTri: true,
  }
}

export const distance =
  (_model: Model) =>
  (_a: Flow.NodeId, _b: Flow.NodeId): number => {
    return 0
  }
