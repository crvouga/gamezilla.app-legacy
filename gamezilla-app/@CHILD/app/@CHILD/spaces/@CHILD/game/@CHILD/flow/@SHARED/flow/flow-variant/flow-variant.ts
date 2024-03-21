import { p } from "gamezilla-app/@SHARED/core/parser"
import { Flow } from "../flow"
import { FlowGrid } from "./flow-grid"
import { FlowHex } from "./flow-hex"
import { FlowTri } from "./flow-tri"
import * as FlowVariantDimensions from "./flow-variant-dimensions"

export const Model = p.or(FlowGrid.Model, FlowHex.Model, FlowTri.Model)
export type Model = p.Infer<typeof Model>

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

    case "flow-tri": {
      return FlowTri.distance(flow)
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

    case "flow-tri": {
      return FlowTri.init({ ...input, dimensions: input.dimensions })
    }
  }
}
