import { p } from '~/@/parser'
import { Flow } from '../../flow'
import * as VariantTriDimensions from './tri-dimensions'
import { NodeId } from '../../flow/node-id'

export const Model = p.and(
  Flow.Model,
  VariantTriDimensions.Model,
  p.obj({
    t: p.l('flow-tri'),
    VariantTri: p.l(true),
  }),
)
export type Model = p.Infer<typeof Model>

export const init = (input: {
  dimensions: VariantTriDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  return {
    ...Flow.init,
    ...input.dimensions,
    t: 'flow-tri',
    VariantTri: true,
  }
}

export const distance = (_model: Model, _a: NodeId, _b: NodeId): number => {
  return 0
}
