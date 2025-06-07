import { s } from '~/@/schema'
import { Numberlink } from '../numberlink'
import { NodeId } from '../numberlink/node-id'
import { Terminal } from '../numberlink/terminal'
import { VariantGrid } from './grid'
import { VariantHex } from './hex'
import { VariantTri } from './tri'
import type * as VariantDimensions from './variant-dimensions'

export const Model = s.or(VariantGrid.Model, VariantHex.Model, VariantTri.Model)
export type Model = s.Infer<typeof Model>

export const isGrid = (numberlink: Model): numberlink is VariantGrid.Model => {
  return numberlink.t === 'grid'
}

export const isHex = (numberlink: Model): numberlink is VariantHex.Model => {
  return numberlink.t === 'hex'
}

export const isTri = (numberlink: Model): numberlink is VariantTri.Model => {
  return numberlink.t === 'tri'
}

export const distance = (numberlink: Model, a: NodeId, b: NodeId): number => {
  switch (numberlink.t) {
    case 'grid': {
      return VariantGrid.distance(numberlink, a, b)
    }

    case 'hex': {
      return VariantHex.distance(numberlink, a, b)
    }

    case 'tri': {
      return VariantTri.distance(numberlink, a, b)
    }
  }
}

export const toTerminalDistance = (model: Model, terminal: Terminal): number => {
  if (!terminal.endId) return Number.POSITIVE_INFINITY
  return distance(model, terminal.startId, terminal.endId)
}

export const init = (input: {
  dimensions: VariantDimensions.Model
  terminalsByGroupId: Numberlink.Model['terminalsByGroupId']
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

export const toDimensions = (numberlink: Model): VariantDimensions.Model => {
  switch (numberlink.t) {
    case 'grid': {
      return VariantGrid.toDimensions(numberlink)
    }

    case 'hex': {
      return VariantHex.toDimensions(numberlink)
    }

    case 'tri': {
      return VariantTri.toDimensions(numberlink)
    }
  }
}
