import { s } from '~/@/schema'
import { NodeId } from './node-id'

const schema = s.brand(s.str, 'EdgeId')

export type EdgeId = s.Infer<typeof schema>

const EDGE_ID_SEPARATOR = '->'

const init = (sourceId: NodeId, targetId: NodeId): EdgeId => {
  return `${sourceId}${EDGE_ID_SEPARATOR}${targetId}` as EdgeId
}

const is = (edgeId: unknown): edgeId is EdgeId => {
  return typeof edgeId === 'string'
}

export const EdgeId = {
  init,
  is,
  ...schema,
}
