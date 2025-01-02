import { p } from '~/@/parser'
import { Flow } from '../../flow'
import * as FlowTriDimensions from './flow-tri-dimensions'
import { FlowNodeId } from '../../flow/flow-node-id'

export const Model = p.and(
  Flow.Model,
  FlowTriDimensions.Model,
  p.obj({
    t: p.l('flow-tri'),
    FlowTri: p.l(true)
  })
)
export type Model = p.Infer<typeof Model>

export const init = (input: {
  dimensions: FlowTriDimensions.Model
  terminalsByGroupId: Flow.Model['terminalsByGroupId']
}): Model => {
  return {
    ...Flow.init,
    ...input.dimensions,
    t: 'flow-tri',
    FlowTri: true
  }
}

export const distance = (_model: Model, _a: FlowNodeId, _b: FlowNodeId): number => {
  return 0
}
