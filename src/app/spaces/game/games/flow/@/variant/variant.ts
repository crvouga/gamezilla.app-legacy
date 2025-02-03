import { p } from '~/@/parser'
import type { Flow } from '../flow'
import { NodeId } from '../flow/node-id'
import { VariantGrid } from './grid'
import { VariantHex } from './hex'
import { VariantTri } from './tri'
import type * as VariantDimensions from './variant-dimensions'

export const Model = p.or(VariantGrid.Model, VariantHex.Model, VariantTri.Model)
export type Model = p.Infer<typeof Model>

export const isGrid = (flow: Model): flow is VariantGrid.Model => {
  return flow.t === 'flow-grid'
}

export const isHex = (flow: Model): flow is VariantHex.Model => {
  return flow.t === 'flow-hex'
}

export const isTri = (flow: Model): flow is VariantTri.Model => {
  return flow.t === 'flow-tri'
}

export const distance = (flow: Model, a: NodeId, b: NodeId): number => {
  switch (flow.t) {
    case 'flow-grid': {
      return VariantGrid.distance(flow, a, b)
    }

    case 'flow-hex': {
      return VariantHex.distance(flow, a, b)
    }

    case 'flow-tri': {
      return VariantTri.distance(flow, a, b)
    }
  }
}

export const init = (input: {
  dimensions: VariantDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  switch (input.dimensions.t) {
    case 'flow-grid': {
      return VariantGrid.init({ ...input, dimensions: input.dimensions })
    }

    case 'flow-hex': {
      return VariantHex.init({ ...input, dimensions: input.dimensions })
    }

    case 'flow-tri': {
      return VariantTri.init({ ...input, dimensions: input.dimensions })
    }
  }
}

export const toDimensions = (flow: Model): VariantDimensions.Model => {
  switch (flow.t) {
    case 'flow-grid': {
      return VariantGrid.toDimensions(flow)
    }

    case 'flow-hex': {
      return VariantHex.toDimensions(flow)
    }

    case 'flow-tri': {
      return VariantTri.toDimensions(flow)
    }
  }
}
