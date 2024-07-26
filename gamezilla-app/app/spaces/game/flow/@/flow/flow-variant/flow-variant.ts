import { p } from 'gamezilla-app/@/core/parser'
import type { Flow } from '../flow'
import { FlowGrid } from './flow-grid'
import { FlowHex } from './flow-hex'
import { FlowTri } from './flow-tri'
import type * as FlowVariantDimensions from './flow-variant-dimensions'
import { FlowNodeId } from '../flow/flow-node-id'

export const Model = p.or(FlowGrid.Model, FlowHex.Model, FlowTri.Model)
export type Model = p.Infer<typeof Model>

export const isGrid = (flow: Model): flow is FlowGrid.Model => {
  return flow.t === 'flow-grid'
}

export const isHex = (flow: Model): flow is FlowHex.Model => {
  return flow.t === 'flow-hex'
}

export const isTri = (flow: Model): flow is FlowTri.Model => {
  return flow.t === 'flow-tri'
}

export const distance = (flow: Model, a: FlowNodeId, b: FlowNodeId): number => {
  switch (flow.t) {
    case 'flow-grid': {
      return FlowGrid.distance(flow, a, b)
    }

    case 'flow-hex': {
      return FlowHex.distance(flow, a, b)
    }

    case 'flow-tri': {
      return FlowTri.distance(flow, a, b)
    }
  }
}

export const init = (input: {
  dimensions: FlowVariantDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  switch (input.dimensions.t) {
    case 'flow-grid': {
      return FlowGrid.init({
        ...input,
        dimensions: input.dimensions
      })
    }

    case 'flow-hex': {
      return FlowHex.init({
        ...input,
        dimensions: input.dimensions
      })
    }

    case 'flow-tri': {
      return FlowTri.init({
        ...input,
        dimensions: input.dimensions
      })
    }
  }
}
