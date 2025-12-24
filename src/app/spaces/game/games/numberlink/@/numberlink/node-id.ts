import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type NodeId = Brand<string, 'NodeId'>

const is = (nodeId: unknown): nodeId is NodeId => {
  return typeof nodeId === 'string' && nodeId.length > 0
}

const schema = s.custom(is, 'Invalid node id')

const init = (nodeId: string): NodeId => {
  return nodeId as NodeId
}

export const NodeId = {
  init,
  is,
  ...schema,
}
