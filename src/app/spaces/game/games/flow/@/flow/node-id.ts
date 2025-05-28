import { s } from '~/@/schema'

const parser = s.brand(s.str, 'NodeId')

export type NodeId = s.Infer<typeof parser>

const init = (nodeId: string): NodeId => {
  return nodeId as NodeId
}

const is = (nodeId: unknown): nodeId is NodeId => {
  return parser.parse(nodeId).t === 'ok'
}

export const NodeId = {
  init,
  is,
  ...parser,
}
