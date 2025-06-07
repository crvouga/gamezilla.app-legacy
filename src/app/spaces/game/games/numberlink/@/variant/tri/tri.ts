import { s } from '~/@/schema'
import { Numberlink } from '../../numberlink'
import * as VariantTriDimensions from './tri-dimensions'
import { NodeId } from '../../numberlink/node-id'

export const Model = s.and(
  Numberlink.Model,
  VariantTriDimensions.Model,
  s.obj({
    t: s.l('tri'),
    VariantTri: s.l(true),
  }),
)
export type Model = s.Infer<typeof Model>

export const init = (input: {
  dimensions: VariantTriDimensions.Model
  terminalsByGroupId: Numberlink.Model['terminalsByGroupId']
}): Model => {
  return {
    ...Numberlink.init,
    ...input.dimensions,
    t: 'tri',
    VariantTri: true,
  }
}

export const distance = (_model: Model, _a: NodeId, _b: NodeId): number => {
  return 0
}

export const toDimensions = (model: Model): VariantTriDimensions.Model => {
  return {
    t: 'tri',
    side: model.side,
  }
}
