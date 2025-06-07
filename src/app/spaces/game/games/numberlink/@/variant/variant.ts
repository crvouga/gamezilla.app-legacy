import { s } from '~/@/schema'
import type { Flow } from '../numberlink'
import { NodeId } from '../numberlink/node-id'
import { VariantGrid } from './grid'
import { VariantHex } from './hex'
import { VariantTri } from './tri'
import type * as VariantDimensions from './variant-dimensions'
import { Terminal } from '../numberlink/terminal'

export const Model = s.or(VariantGrid.Model, VariantHex.Model, VariantTri.Model)
export type Model = s.Infer<typeof Model>

export const isGrid = (flow: Model): flow is VariantGrid.Model => {
  return flow.t === 'grid'
}

export const isHex = (flow: Model): flow is VariantHex.Model => {
  return flow.t === 'hex'
}

export const isTri = (flow: Model): flow is VariantTri.Model => {
  return flow.t === 'tri'
}

export const distance = (flow: Model, a: NodeId, b: NodeId): number => {
  switch (flow.t) {
    case 'grid': {
      return VariantGrid.distance(flow, a, b)
    }

    case 'hex': {
      return VariantHex.distance(flow, a, b)
    }

    case 'tri': {
      return VariantTri.distance(flow, a, b)
    }
  }
}

export const toTerminalDistance = (model: Model, terminal: Terminal): number => {
  if (!terminal.endId) return Number.POSITIVE_INFINITY
  return distance(model, terminal.startId, terminal.endId)
}

export const init = (input: {
  dimensions: VariantDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  switch (input.dimensions.t) {
    case 'grid': {
      return VariantGrid.init({ ...input, dimensions: input.dimensions })
    }

    case 'hex': {
      return VariantHex.init({ ...input, dimensions: input.dimensions })
    }

    case 'tri': {
      return VariantTri.init({ ...input, dimensions: input.dimensions })
    }
  }
}

export const toDimensions = (flow: Model): VariantDimensions.Model => {
  switch (flow.t) {
    case 'grid': {
      return VariantGrid.toDimensions(flow)
    }

    case 'hex': {
      return VariantHex.toDimensions(flow)
    }

    case 'tri': {
      return VariantTri.toDimensions(flow)
    }
  }
}
