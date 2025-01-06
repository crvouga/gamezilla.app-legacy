import { p } from '~/@/parser'
import { NodeId } from './node-id'

const parser = p.brand(p.str, 'EdgeId')

export type EdgeId = p.Infer<typeof parser>

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
  ...parser,
}
