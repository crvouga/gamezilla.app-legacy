import { s } from '~/@/schema'

const schema = s.brand(s.str, 'NodeId')

export type NodeId = s.Infer<typeof schema>

const init = (nodeId: string): NodeId => {
  return nodeId as NodeId
}

const is = (nodeId: unknown): nodeId is NodeId => {
  return schema.parse(nodeId).t === 'ok'
}

export const NodeId = {
  init,
  is,
  ...schema,
}
