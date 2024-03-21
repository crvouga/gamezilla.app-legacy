import { memoize } from "gamezilla-app/@SHARED/core"
import { Brand } from "gamezilla-app/@SHARED/core/brand"
import { p } from "gamezilla-app/@SHARED/parser"

export type NodeId = Brand<string, "NodeId">
export const isNodeId = (nodeId: unknown): nodeId is NodeId => {
  return typeof nodeId === "string"
}
export const NodeId = p.custom(isNodeId, "Invalid node id")

export const createNodeId = (nodeId: string): NodeId => {
  return nodeId as NodeId
}

export type EdgeId = Brand<string, "EdgeId">

export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"

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

const EDGE_ID_SEPARATOR = "->"

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.sourceId}${EDGE_ID_SEPARATOR}${edge.targetId}` as EdgeId
}

export const isEdgeId = (model: Model, edgeId: string): edgeId is EdgeId => {
  return edgeId in model.edges
}

export const hasNodeId = (model: Model, nodeId: string): nodeId is NodeId => {
  return nodeId in model.nodes
}

/**
 *
 * Model
 *
 *
 * Represents the entire puzzle.
 * The puzzle is a directed graph
 */

/** @see {isModel} ts-auto-guard:type-guard */
export type Model = {
  Flow: true
  /**
   * The set of all valid nodes in the puzzle.
   */
  nodes: {
    [nodeId: NodeId]: Node
  }

  /**
   * The set of all valid connections between nodes.
   */
  edges: {
    [edgeId: EdgeId]: Edge
  }

  edgeHash: string | number

  /**
   * Represents the start and end nodes for each group.
   */
  terminalsByGroupId: {
    [groupId in GroupId]?: Terminal
  }

  /**
   * Represents the pipes that are connected to each node.
   * We index each pipe with pipe's source node
   * so that it's impossible for a node to be associated with more than one group
   */
  pipesBySourceId: {
    [sourceId: NodeId]: Pipe
  }
}

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
 * A terminal represents the start and end nodes for a group.
 * These are the two circles the user is trying to connect
 */
export type Terminal = {
  groupId: GroupId
  startId: NodeId
  endId?: NodeId | null
}

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
 * A `Pipe` associates an edge with a group.
 * These are the lines the user draws in the puzzle.
 */
export type Pipe = {
  groupId: GroupId
  edgeId: EdgeId
}

export type PipeJoined = Pipe & {
  edge: Edge
}

/**
 * Represents a connection between two nodes.
 */
export type Edge = {
  sourceId: NodeId
  targetId: NodeId
}

export type Node = {
  nodeId: NodeId
}

export const toNodes = (model: Model): { [nodeId: NodeId]: Node } => {
  return model.nodes
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
    if (!isEdgeId(model, edgeId)) {
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
