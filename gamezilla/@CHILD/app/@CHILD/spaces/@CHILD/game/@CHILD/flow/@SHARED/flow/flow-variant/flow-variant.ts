import { Flow } from "../flow"
import { FlowGrid } from "../flow-variant-grid"
import { FlowHex } from "../flow-variant-hex"
import * as FlowVariantDimensions from "./flow-variant-dimensions"

export type Model = FlowGrid.Model | FlowHex.Model

export const distance = (
  flow: Model,
): ((a: Flow.NodeId, b: Flow.NodeId) => number) => {
  switch (flow.t) {
    case "flow-grid": {
      return FlowGrid.distance(flow)
    }

    case "flow-hex": {
      return FlowHex.distance(flow)
    }
  }
}

export const init = (input: {
  dimensions: FlowVariantDimensions.Model
  terminalsByGroupId: Flow.Model["terminalsByGroupId"]
}): Model => {
  switch (input.dimensions.t) {
    case "flow-grid": {
      return FlowGrid.init({ ...input, dimensions: input.dimensions })
    }

    case "flow-hex": {
      return FlowHex.init({ ...input, dimensions: input.dimensions })
    }
  }
}
