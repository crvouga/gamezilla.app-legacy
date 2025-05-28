import { p } from '~/@/schema'

const parser = p.brand(p.str, 'NodeId')

export type NodeId = p.Infer<typeof parser>

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
