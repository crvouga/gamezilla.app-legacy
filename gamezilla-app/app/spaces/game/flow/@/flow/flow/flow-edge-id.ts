import { p } from 'gamezilla-app/@/core/parser'
import { FlowNodeId } from './flow-node-id'

const parser = p.brand(p.str, 'FlowEdgeId')

export type FlowEdgeId = p.Infer<typeof parser>

const EDGE_ID_SEPARATOR = '->'

const init = (sourceId: FlowNodeId, targetId: FlowNodeId): FlowEdgeId => {
  return `${sourceId}${EDGE_ID_SEPARATOR}${targetId}` as FlowEdgeId
}

const is = (edgeId: unknown): edgeId is FlowEdgeId => {
  return typeof edgeId === 'string'
}

export const FlowEdgeId = {
  init,
  is,
  ...parser
}
