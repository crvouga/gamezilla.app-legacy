import { p } from '~/@/core/parser'

const parser = p.brand(p.str, 'NodeId')

export type FlowNodeId = p.Infer<typeof parser>

const init = (nodeId: string): FlowNodeId => {
  return nodeId as FlowNodeId
}

const is = (nodeId: unknown): nodeId is FlowNodeId => {
  return parser.parse(nodeId).t === 'ok'
}

export const FlowNodeId = {
  init,
  is,
  ...parser
}
