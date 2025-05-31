import { s } from '~/@/schema'
import { Flow } from '../../flow'
import * as VariantHexDimensions from './hex-dimensions'
import { NodeId } from '../../flow/node-id'

export const HexPosition = s.obj({
  x: s.num(),
  y: s.num(),
  z: s.num(),
})
export type HexPosition = s.Infer<typeof HexPosition>

export const Model = s.and(
  Flow.Model,
  VariantHexDimensions.Model,
  s.obj({
    t: s.l('flow-hex'),
    VariantHex: s.l(true),
    positions: s.dict(NodeId, HexPosition),
  }),
)
export type Model = s.Infer<typeof Model>

export const init = (input: {
  dimensions: VariantHexDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  return {
    ...Flow.init,
    ...input.dimensions,
    t: 'flow-hex',
    VariantHex: true,
    positions: {},
  }
}

export const distance = (model: Model, a: NodeId, b: NodeId): number => {
  const positionA = model.positions[a]

  if (!positionA) {
    return Number.POSITIVE_INFINITY
  }

  const positionB = model.positions[b]

  if (!positionB) {
    return Number.POSITIVE_INFINITY
  }

  return hexDistance(positionA, positionB)
}

const hexDistance = (a: HexPosition, b: HexPosition): number => {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}

export const toDimensions = (model: Model): VariantHexDimensions.Model => {
  return {
    t: 'flow-hex',
    height: model.height,
    side: model.side,
    width: model.width,
  }
}
