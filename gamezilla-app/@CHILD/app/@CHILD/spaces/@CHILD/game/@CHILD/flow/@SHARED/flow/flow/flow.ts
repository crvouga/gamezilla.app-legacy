import { memoize } from "gamezilla-app/@SHARED/core"
import { Brand } from "gamezilla-app/@SHARED/core/brand"
import { p } from "gamezilla-app/@SHARED/parser"

//
//
//
//
//
//

export type NodeId = Brand<string, "NodeId">
export const isNodeId = (nodeId: unknown): nodeId is NodeId => {
  return typeof nodeId === "string"
}
export const NodeId = p.custom(isNodeId, "Invalid node id")

export const createNodeId = (nodeId: string): NodeId => {
  return nodeId as NodeId
}

export const hasNodeId = (model: Model, nodeId: string): nodeId is NodeId => {
  return nodeId in model.nodes
}

//
//
//
//
//

export const GROUP_ID_ORDER = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
] as const

export const isGroupId = (groupId: unknown): groupId is GroupId => {
  return GROUP_ID_ORDER.includes(groupId as GroupId)
}

export const GroupId = p.enumeration(GROUP_ID_ORDER)

export type GroupId = p.Infer<typeof GroupId>

//
//
//
//
//

export type EdgeId = Brand<string, "EdgeId">

const EDGE_ID_SEPARATOR = "->"

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.sourceId}${EDGE_ID_SEPARATOR}${edge.targetId}` as EdgeId
}

export const hasEdgeId = (model: Model, edgeId: string): edgeId is EdgeId => {
  return edgeId in model.edges
}

export const isEdgeId = (edgeId: unknown): edgeId is EdgeId => {
  return typeof edgeId === "string"
}

export const EdgeId = p.custom(isEdgeId, "Invalid edge id")

//
//
//
//
//
//
//

/**
 * A terminal represents the start and end nodes for a group.
 * These are the two circles the user is trying to connect
 */

export const Terminal = p.obj({
  groupId: GroupId,
  startId: NodeId,
  endId: p.maybe(NodeId),
})
export type Terminal = p.Infer<typeof Terminal>

export const isSameTerminal = (a: Terminal, b: Terminal): boolean => {
  const startA = a.startId ?? null
  const startB = b.startId ?? null
  const endA = a.endId ?? null
  const endB = b.endId ?? null
  const isSameNodes =
    (startA === startB && endA === endB) || (endA === startB && startA === endB)
  const isSameGroup = a.groupId === b.groupId
  const isSame = isSameNodes && isSameGroup
  return isSame
}

export const isSameTerminalsByGroupId = (
  a: Model["terminalsByGroupId"],
  b: Model["terminalsByGroupId"],
): boolean => {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false
  }
  for (const groupId in a) {
    const terminalA = a[groupId as GroupId]
    if (!terminalA) {
      return false
    }
    const terminalB = b[groupId as GroupId]
    if (!terminalB) {
      return false
    }
    if (!isSameTerminal(terminalA, terminalB)) {
      return false
    }
  }
  return true
}

/**
 * Represents a connection between two nodes.
 */
export const Edge = p.obj({
  sourceId: NodeId,
  targetId: NodeId,
})
export type Edge = p.Infer<typeof Edge>

/**
 * A `Pipe` associates an edge with a group.
 * These are the lines the user draws in the puzzle.
 */
export const Pipe = p.obj({
  groupId: GroupId,
  edgeId: EdgeId,
})
export type Pipe = p.Infer<typeof Pipe>

export const PipeJoined = p.and(
  Pipe,
  p.obj({
    edge: Edge,
  }),
)
export type PipeJoined = p.Infer<typeof PipeJoined>

export const Node = p.obj({
  nodeId: NodeId,
})
export type Node = p.Infer<typeof Node>

export const toNodes = (model: Model): { [nodeId: NodeId]: Node } => {
  return model.nodes
}

/**
 *
 * Model
 *
 *
 * Represents the entire puzzle.
 * The puzzle is a directed graph
 */

const Model = p.obj({
  Flow: p.l(true),

  /**
   * The set of all valid nodes in the puzzle.
   */
  nodes: p.dict(NodeId, Node),

  /**
   * The set of all valid connections between nodes.
   */
  edges: p.dict(EdgeId, Edge),

  /**
   * Represents the start and end nodes for each group.
   */
  terminalsByGroupId: p.partialDict(GroupId, Terminal),

  /**
   * Represents the pipes that are connected to each node.
   * We index each pipe with pipe's source node
   * so that it's impossible for a node to be associated with more than one group
   */
  pipesBySourceId: p.dict(NodeId, Pipe),

  edgeHash: p.or(p.str, p.num),
})

export type Model = p.Infer<typeof Model>

/**
 *
 */
export const init: Model = {
  Flow: true,
  nodes: {},
  edges: {},
  terminalsByGroupId: {},
  pipesBySourceId: {},
  edgeHash: 0,
}

/**
 * Finds node
 */
export const toNode = (model: Model, nodeId: NodeId): Node | null => {
  return toNodes(model)[nodeId] ?? null
}

/**
 * Finds edge
 */
export const toEdge = (model: Model, edgeId: EdgeId): Edge | null => {
  const edge = model.edges[edgeId]

  if (!edge) {
    return null
  }

  return edge
}

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, node: Node): Model => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [node.nodeId]: node,
    },
  }
}

export const deriveEdgeHash = (
  model: Pick<Model, "edges">,
): string | number => {
  return djb2Hash(Object.values(model.edges).sort().join(","))
}

/**
 * Adds an edge to the puzzle.
 */
export const addEdge = (model: Model, edge: Edge): Model => {
  const modelNew: Model = {
    ...model,
    edges: {
      ...model.edges,
      [toEdgeId(edge)]: edge,
    },
  }
  const hashNew = deriveEdgeHash(modelNew)
  return { ...modelNew, edgeHash: hashNew }
}

/**
 *
 */
const hasNode = (model: Model, nodeId: NodeId): boolean => {
  return nodeId in model.nodes
}

/**
 * @param model
 */
export const addTerminal = (model: Model, terminal: Terminal): Model => {
  if (terminal.endId === terminal.startId) {
    return model
  }

  if (!hasNode(model, terminal.startId)) {
    return model
  }

  if (terminal.endId && !hasNode(model, terminal.endId)) {
    return model
  }

  return {
    ...model,
    terminalsByGroupId: {
      ...model.terminalsByGroupId,
      [terminal.groupId]: terminal,
    },
  }
}

export const removeTerminal = (model: Model, groupId: GroupId): Model => {
  const terminalsByGroupIdNew = { ...model.terminalsByGroupId }
  delete terminalsByGroupIdNew[groupId]
  return {
    ...model,
    terminalsByGroupId: terminalsByGroupIdNew,
  }
}

/**
 * Yields all nodes in the model.
 */
export const yieldNodes = function* (model: Model): Generator<Node> {
  for (const nodeId in model.nodes) {
    if (!hasNodeId(model, nodeId)) {
      continue
    }

    const node = model.nodes[nodeId]

    if (node) {
      yield node
    }
  }
}

/**
 *
 */

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
  for (const nodeId in model.pipesBySourceId) {
    if (!hasNodeId(model, nodeId)) {
      continue
    }

    const pipe = model.pipesBySourceId[nodeId]

    if (!pipe) {
      continue
    }

    const edge = toEdge(model, pipe.edgeId)

    if (!edge) {
      continue
    }

    yield {
      ...pipe,
      edge,
    }
  }
}

/**
 * Yields all edges in the model.
 */
export const yieldEdges = function* (model: Model): Generator<Edge> {
  for (const edgeId in model.edges) {
    if (!hasEdgeId(model, edgeId)) {
      continue
    }

    const edge = toEdge(model, edgeId)

    if (!edge) {
      continue
    }

    yield edge
  }
}

export const toIndexEdgesOut = (model: Model) => {
  let indexEdgesOut: { [sourceId: NodeId]: { [targetId: NodeId]: EdgeId } } = {}

  for (const edge of yieldEdges(model)) {
    indexEdgesOut = {
      ...indexEdgesOut,
      [edge.sourceId]: {
        ...indexEdgesOut[edge.sourceId],
        [edge.targetId]: toEdgeId(edge),
      },
    }
  }
  return indexEdgesOut
}

export const toIndexEdgesOutMemoized = memoize({
  toKey: (model) => model.edgeHash,
  func: toIndexEdgesOut,
  cacheCapacity: 100,
})

export const toIndexEdgesIn = (model: Model) => {
  let indexEdgesIn: { [targetId: NodeId]: { [sourceId: NodeId]: EdgeId } } = {}

  for (const edge of yieldEdges(model)) {
    indexEdgesIn = {
      ...indexEdgesIn,
      [edge.targetId]: {
        ...indexEdgesIn[edge.targetId],
        [edge.sourceId]: toEdgeId(edge),
      },
    }
  }
  return indexEdgesIn
}

/**
 * Yields all edges where the inputted node is the source node
 */
export const yieldEdgesOut = function* (
  model: Model,
  sourceNodeId: NodeId,
): Iterable<Edge> {
  const indexEdgesOut = toIndexEdgesOutMemoized(model)

  for (const targetId in indexEdgesOut[sourceNodeId]) {
    const edgeId = indexEdgesOut[sourceNodeId]?.[targetId as NodeId]

    if (!edgeId) {
      continue
    }

    const edge = toEdge(model, edgeId)

    if (!edge) {
      continue
    }

    yield edge
  }
}

/**
 * Yields all edges where the inputted node is the source node
 */
export const yieldEdgesIn = function* (
  model: Model,
  targetNodeId: NodeId,
): Iterable<Edge> {
  const indexEdgesIn = toIndexEdgesIn(model)
  for (const sourceId in indexEdgesIn[targetNodeId]) {
    if (!hasNodeId(model, sourceId)) {
      continue
    }

    const edgeId = indexEdgesIn[targetNodeId]?.[sourceId]

    if (!edgeId) {
      continue
    }

    const edge = toEdge(model, edgeId)

    if (!edge) {
      continue
    }

    yield edge
  }
}

/**
 *
 */
export const yieldTerminals = function* (model: Model): Iterable<Terminal> {
  for (const groupId in model.terminalsByGroupId) {
    if (!isGroupId(groupId)) {
      continue
    }

    const terminal = model.terminalsByGroupId[groupId]

    if (!terminal) {
      continue
    }

    yield terminal
  }
}

/**
 *
 */
export const toGroupId = (model: Model, nodeId: NodeId): GroupId | null => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.startId === nodeId) {
      return terminal.groupId
    }
    if (terminal.endId === nodeId) {
      return terminal.groupId
    }
  }

  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.sourceId === nodeId) {
      return pipe.groupId
    }
    if (pipe.edge.targetId === nodeId) {
      return pipe.groupId
    }
  }
  return null
}

export const toPipeBySourceId = (
  model: Model,
  sourceId: NodeId,
): PipeJoined | null => {
  const pipe = model.pipesBySourceId[sourceId]
  if (!pipe) {
    return null
  }
  const edge = toEdge(model, pipe.edgeId)
  if (!edge) {
    return null
  }
  return {
    ...pipe,
    edge,
  }
}

export const hasEdge = (
  model: Model,
  sourceId: NodeId,
  targetId: NodeId,
): boolean => {
  return toEdgeId({ sourceId, targetId }) in model.edges
}

/**
 * Finds the terminal associated with the inputted group.
 */
export const toTerminalByGroupId = (
  model: Model,
  groupId: GroupId,
): Terminal | null => {
  return model.terminalsByGroupId[groupId] ?? null
}

export const toIndexTerminalByEndId = (_model: Model) => {
  // TODO
  return {}
}

/**
 * Find the terminal where the inputted node id is either the start or end node.
 */
export const findTerminalByNodeId = (
  model: Model,
  nodeId: NodeId,
): Terminal | null => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.startId === nodeId) {
      return terminal
    }
    if (terminal.endId === nodeId) {
      return terminal
    }
  }
  return null
}
export const findPipeByNodeId = (
  model: Model,
  nodeId: NodeId,
): PipeJoined | null => {
  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.sourceId === nodeId) {
      return pipe
    }
    if (pipe.edge.targetId === nodeId) {
      return pipe
    }
  }
  return null
}

/**
 *
 */
export const addPipe = (model: Model, pipe: Pipe): Model | null => {
  const edge = toEdge(model, pipe.edgeId)

  if (!edge) {
    return null
  }

  return {
    ...model,
    pipesBySourceId: {
      ...model.pipesBySourceId,
      [edge.sourceId]: pipe,
    },
  }
}

export const findGroupIdByNodeId = (
  model: Model,
  nodeId: NodeId,
): GroupId | null => {
  const terminal = findTerminalByNodeId(model, nodeId)

  if (terminal) {
    return terminal.groupId
  }

  const pipe = findPipeByNodeId(model, nodeId)

  if (pipe) {
    return pipe.groupId
  }

  return null
}

/**
 * Flips the start and end nodes of the inputted terminal.
 */
export const flipTerminal = (model: Model, terminal: Terminal): Model => {
  if (!terminal.endId) {
    return model
  }

  const terminalNew: Terminal = {
    ...terminal,
    startId: terminal.endId,
    endId: terminal.startId,
  }

  return {
    ...model,
    terminalsByGroupId: {
      ...model.terminalsByGroupId,
      [terminal.groupId]: terminalNew,
    },
  }
}

function djb2Hash(str: string) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) + hash + char /* hash * 33 + c */
  }
  return hash
}
