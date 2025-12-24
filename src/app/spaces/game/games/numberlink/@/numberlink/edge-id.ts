import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { NodeId } from './node-id'

export type EdgeId = Brand<string, 'EdgeId'>

const EDGE_ID_SEPARATOR = '->'

const init = (sourceId: NodeId, targetId: NodeId): EdgeId => {
  return `${sourceId}${EDGE_ID_SEPARATOR}${targetId}` as EdgeId
}

const is = (edgeId: unknown): edgeId is EdgeId => {
  return typeof edgeId === 'string' && edgeId.length > 0
}

const schema = s.custom(is, 'Invalid edge id')

export const EdgeId = {
  init,
  is,
  ...schema,
}
