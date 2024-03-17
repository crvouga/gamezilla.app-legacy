import { Parsing as P } from "gamezilla-app/@SHARED/parsing"
import {
  Edge,
  Model,
  Node,
  NodeId,
  Terminal,
  deriveEdgeHash,
  isGroupId,
} from "./flow"

const isEdgeId = (x: unknown): x is string => {
  return P.str(x)
}

const toEdge = (x: unknown): Edge | null => {
  if (
    P.obj(x) &&
    P.has(x, "sourceId", isNodeId) &&
    P.has(x, "targetId", isNodeId)
  ) {
    return x
  }
  return null
}

const isEdge = P.is(toEdge)

const toEdges = (x: unknown): Model["edges"] | null => {
  if (P.dict(isEdgeId, isEdge)(x)) {
    return x
  }
  return null
}

const isEdges = P.is(toEdges)

const isNodeId = (x: unknown): x is NodeId => {
  return P.str(x)
}

export const toNode = (x: unknown): Node | null => {
  if (P.obj(x) && P.has(x, "nodeId", isNodeId)) {
    return x
  }

  return null
}

export const isNode = P.is(toNode)

const toNodes = (x: unknown): Model["nodes"] | null => {
  if (P.dict(isNodeId, isNode)(x)) {
    return x
  }
  return null
}

const isNodes = P.is(toNodes)

const toTerminal = (x: unknown): Terminal | null => {
  if (
    P.obj(x) &&
    P.has(x, "startId", isNodeId) &&
    P.has(x, "endId", P.or(isNodeId, P.nullish)) &&
    P.has(x, "groupId", isGroupId)
  ) {
    return x
  }
  return null
}

const isTerminal = P.is(toTerminal)

const toTerminalsByGroupId = (
  x: unknown,
): Model["terminalsByGroupId"] | null => {
  if (P.dict(isGroupId, isTerminal)(x)) {
    return x
  }
  return null
}

const isTerminalsByGroupId = P.is(toTerminalsByGroupId)

export const toModel = (x: unknown): Model | null => {
  if (
    P.obj(x) &&
    P.has(x, "nodes", P.obj) &&
    P.has(x, "edges", isEdges) &&
    P.has(x, "nodes", isNodes) &&
    P.has(x, "terminalsByGroupId", isTerminalsByGroupId)
  ) {
    return {
      Flow: true,
      edges: x.edges,
      nodes: x.nodes,
      terminalsByGroupId: x.terminalsByGroupId,
      edgeHash: deriveEdgeHash(x),
      pipesBySourceId: {},
    }
  }
  return null
}

export const isModel = P.is(toModel)
