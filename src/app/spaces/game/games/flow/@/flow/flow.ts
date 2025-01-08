import { descend } from '~/@/array/sorting'
import { eq } from '~/@/equals/equals'
import { memoize } from '~/@/function/memoize'
import { pipe } from '~/@/function/pipe'
import { djb2Hash } from '~/@/hash/djb2'
import { p } from '~/@/parser'
import { EdgeId } from './edge-id'
import { GroupId } from './group-id'
import { NodeId } from './node-id'
import { Terminal } from './terminal'

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

export const Model = p.obj({
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
   * Represents the start and end nodes for each pipeline.
   */
  terminalsByGroupId: p.partialDict(GroupId, Terminal),

  /**
   * Represents the pipes that are connected to each node.
   * We index each pipe with pipe's source node
   * so that it's impossible for a node to be associated with more than one group
   */
  pipesBySourceId: p.dict(NodeId, Pipe),

  /**
   * A hash of the edges in the puzzle. Used for memoization.
   */
  edgeHash: p.maybe(p.or(p.str, p.num)),

  /**
   * A hash of the nodes in the puzzle. Used for memoization.
   */
  nodeHash: p.maybe(p.or(p.str, p.num)),
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
  nodeHash: 0,
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
export const toEdge = (model: Pick<Model, 'edges'>, edgeId: EdgeId): Edge | null => {
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
  const modelNew: Model = {
    ...model,
    nodes: {
      ...model.nodes,
      [node.nodeId]: node,
    },
  }
  const nodeHash = deriveNodeHash(modelNew)
  return {
    ...modelNew,
    nodeHash,
  }
}

export const isSameTerminalsByGroupId = (a: Model['terminalsByGroupId'], b: Model['terminalsByGroupId']): boolean => {
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
    if (!Terminal.isSame(terminalA, terminalB)) {
      return false
    }
  }
  return true
}

export const toEdgeId = (edge: Edge): EdgeId => {
  return EdgeId.init(edge.sourceId, edge.targetId)
}

export const hasEdgeId = (model: Model, edgeId: string): edgeId is EdgeId => {
  return edgeId in model.edges
}

export const toReversedPipesBySourceId = (
  model: Pick<Model, 'pipesBySourceId' | 'edges'>,
): Model['pipesBySourceId'] => {
  const reversed: Model['pipesBySourceId'] = {}
  for (const sourceId in model.pipesBySourceId) {
    const pipe = model.pipesBySourceId[sourceId as NodeId]
    if (!pipe) {
      continue
    }
    const edge = toEdge(model, pipe.edgeId)
    if (!edge) {
      continue
    }
    reversed[edge.targetId] = {
      edgeId: toEdgeId({
        sourceId: edge.targetId,
        targetId: edge.sourceId,
      }),
      groupId: pipe.groupId,
    }
  }
  return reversed
}

export const isSamePipesBySourceId = (
  left: Pick<Model, 'pipesBySourceId' | 'edges'>,
  right: Pick<Model, 'pipesBySourceId' | 'edges'>,
): boolean => {
  const isEqual = eq(left.pipesBySourceId, right.pipesBySourceId)
  const reversedB = toReversedPipesBySourceId(right)
  const isEqualReversed = eq(left.pipesBySourceId, reversedB)
  const isSame = isEqual || isEqualReversed
  return isSame
}

export const isSame = (left: Model, right: Model): boolean => {
  const isSameNodes = eq(left.nodes, right.nodes)
  const isSameEdges = eq(left.edges, right.edges)
  const isSameTerminals = isSameTerminalsByGroupId(left.terminalsByGroupId, right.terminalsByGroupId)
  const isSamePipes = isSamePipesBySourceId(left, right)
  return isSamePipes && isSameNodes && isSameEdges && isSameTerminals
}

export const countNodes = (model: Model): number => {
  return Object.keys(model.nodes).length
}

export const deriveEdgeHash = (edges: Model['edges']): string | number => {
  return djb2Hash(Object.values(edges).sort().join(','))
}

export const deriveNodeHash = (nodes: Model['nodes']): string | number => {
  return djb2Hash(Object.values(nodes).sort().join(','))
}

export const deriveTerminalHash = (terminals: Model['terminalsByGroupId']): string | number => {
  const values = Object.values(terminals)
  const sorted = values.sort(descend((t) => GroupId.toOrder(t.groupId)))
  const hashes = sorted.map((terminal) => Terminal.deriveHash(terminal))
  const hash = hashes.join(',')
  return hash
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
  const edgeHash = deriveEdgeHash(modelNew)
  return { ...modelNew, edgeHash }
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
  const terminalsByGroupIdNew = {
    ...model.terminalsByGroupId,
  }
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
    const node = model.nodes[nodeId as NodeId]

    if (!node) {
      continue
    }

    yield node
  }
}

/**
 *
 */

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
  for (const nodeId in model.pipesBySourceId) {
    const pipe = model.pipesBySourceId[nodeId as NodeId]

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
    const edge = toEdge(model, edgeId as EdgeId)

    if (!edge) {
      continue
    }

    yield edge
  }
}

export const toIndexEdgesOut = (model: Model) => {
  const indexEdgesOut: {
    [sourceId: NodeId]: {
      [targetId: NodeId]: EdgeId
    }
  } = {}

  for (const edge of yieldEdges(model)) {
    indexEdgesOut[edge.sourceId] = indexEdgesOut[edge.sourceId] ?? {}
    indexEdgesOut[edge.sourceId]![edge.targetId] = toEdgeId(edge)
  }

  return indexEdgesOut
}

export const toIndexEdgesOutMemoized = memoize({
  toKey: (model) => model.edgeHash ?? 0,
  func: toIndexEdgesOut,
  cacheCapacity: 5000,
})

export const toIndexEdgesIn = (model: Model) => {
  let indexEdgesIn: {
    [targetId: NodeId]: {
      [sourceId: NodeId]: EdgeId
    }
  } = {}

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
export const yieldEdgesOut = function* (model: Model, sourceNodeId: NodeId): Iterable<Edge & { edgeId: EdgeId }> {
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

    yield { ...edge, edgeId }
  }
}

/**
 * Yields all edges where the inputted node is the source node
 */
export const yieldEdgesIn = function* (model: Model, targetNodeId: NodeId): Iterable<Edge> {
  const indexEdgesIn = toIndexEdgesIn(model)
  for (const sourceId in indexEdgesIn[targetNodeId]) {
    if (!NodeId.is(sourceId)) {
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
    const terminal = model.terminalsByGroupId[groupId as GroupId]

    if (!terminal) {
      continue
    }

    yield terminal
  }
}

export const yieldFullTerminals = function* (model: Model): Iterable<Terminal> {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.endId) {
      yield terminal
    }
  }
}

export const toFullTerminals = (model: Model): Terminal[] => {
  return Array.from(yieldFullTerminals(model))
}

export const toTerminals = (model: Model): Terminal[] => {
  return Array.from(yieldTerminals(model))
}

export const yieldPipelines = function* (model: Model): Iterable<Iterable<Pipe>> {
  for (const terminal of yieldTerminals(model)) {
    yield yieldPipeline(model, terminal.startId)
  }
}

export const pipelineToGroupId = (pipeline: Iterable<Pipe>): GroupId | null => {
  for (const pipe of pipeline) {
    return pipe.groupId
  }
  return null
}

export type Pipeline = Pipe[]

/**
 * Returns the list of pipes starting from the inputted node
 */
export const toPipeline = (model: Model, sourceNodeId: NodeId, groupId?: GroupId): Pipe[] => {
  const pipe = toPipeBySourceId(model, sourceNodeId)

  if (!pipe) {
    return []
  }

  if (groupId && pipe.groupId !== groupId) {
    return []
  }

  const targetNodeGroupId = toGroupId(model, pipe.edge.targetId)

  if (groupId && targetNodeGroupId !== groupId) {
    return []
  }

  return [pipe, ...toPipeline(model, pipe.edge.targetId, pipe.groupId)]
}

export const toPipelineFromGroupId = (model: Model, groupId: GroupId): Pipe[] => {
  const terminal = toTerminalByGroupId(model, groupId)

  if (!terminal) {
    return []
  }

  return toPipeline(model, terminal.startId)
}

export const yieldPipeline = (model: Model, startingNodeId: NodeId): Iterable<PipeJoined> => {
  const pipeline: PipeJoined[] = []

  let currentNodeId = startingNodeId

  while (true) {
    const pipe = toPipeBySourceId(model, currentNodeId)

    if (!pipe) {
      return pipeline
    }

    pipeline.push(pipe)

    currentNodeId = pipe.edge.targetId
  }
}

/**
 *
 */
export const toGroupId = (model: Model, nodeId: NodeId): GroupId | null => {
  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.sourceId === nodeId) {
      return pipe.groupId
    }
    if (pipe.edge.targetId === nodeId) {
      return pipe.groupId
    }
  }

  for (const terminal of yieldTerminals(model)) {
    if (terminal.startId === nodeId) {
      return terminal.groupId
    }
    if (terminal.endId === nodeId) {
      return terminal.groupId
    }
  }

  return null
}

export const toPipeBySourceId = (model: Model, sourceId: NodeId): PipeJoined | null => {
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

export const hasEdge = (model: Model, sourceId: NodeId, targetId: NodeId): boolean => {
  return (
    toEdgeId({
      sourceId,
      targetId,
    }) in model.edges
  )
}

/**
 * Finds the terminal associated with the inputted group.
 */
export const toTerminalByGroupId = (model: Model, groupId: GroupId): Terminal | null => {
  return model.terminalsByGroupId[groupId] ?? null
}

export const toIndexTerminalByEndId = (_model: Model) => {
  // TODO
  return {}
}

export const randomNode = (model: Model): Node | null => {
  const nodes = Object.values(model.nodes)

  if (nodes.length === 0) {
    return null
  }

  return nodes[Math.floor(Math.random() * nodes.length)] ?? null
}

export const randomEmptyNode = (model: Model): Node | null => {
  for (let i = 0; i < 100; i++) {
    const node = randomNode(model)
    if (node && !toGroupId(model, node.nodeId)) {
      return node
    }
  }
  return null
}

export const randomTerminal = (model: Model): Terminal | null => {
  const terminals = Object.values(model.terminalsByGroupId)

  if (terminals.length === 0) {
    return null
  }

  return terminals[Math.floor(Math.random() * terminals.length)] ?? null
}

export const randomOutEdge = (model: Model, nodeId: NodeId): Edge | null => {
  const edges = Array.from(yieldEdgesOut(model, nodeId))
  const randomEdge = edges[Math.floor(Math.random() * edges.length)]
  return randomEdge ?? null
}

/**
 * Find the terminal where the inputted node id is either the start or end node.
 */
export const findTerminalByNodeId = (model: Model, nodeId: NodeId): Terminal | null => {
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
export const findPipeByNodeId = (model: Model, nodeId: NodeId): PipeJoined | null => {
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

export const findGroupIdByNodeId = (model: Model, nodeId: NodeId): GroupId | null => {
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
 * Flips the start and end nodes of all terminals.
 */
export const flipAllTerminals = <TModel extends Model>(model: TModel): TModel => {
  const terminalsByGroupId: TModel['terminalsByGroupId'] = {}

  for (const terminal of yieldTerminals(model)) {
    terminalsByGroupId[terminal.groupId] = Terminal.flip(terminal)
  }

  return {
    ...model,
    terminalsByGroupId,
  }
}

/**
 * Flips the start and end nodes of the inputted terminal.
 */
export const flipTerminal = <TModel extends Model>(model: TModel, terminal: Terminal | null): TModel => {
  if (!terminal) {
    return model
  }

  const flipped = Terminal.flip(terminal)

  return {
    ...model,
    terminalsByGroupId: {
      ...model.terminalsByGroupId,
      [terminal.groupId]: flipped,
    },
  }
}

const isConnectedWithPipeOneWay = (model: Model, sourceId: NodeId, targetId: NodeId): boolean => {
  const visited = new Set<NodeId>()

  let currentId = sourceId

  while (true) {
    if (visited.has(currentId)) {
      return false
    }

    visited.add(currentId)

    if (currentId === targetId) {
      return true
    }

    const pipe = toPipeBySourceId(model, currentId)

    if (!pipe) {
      return false
    }

    const edge = toEdge(model, pipe.edgeId)

    if (!edge) {
      return false
    }

    currentId = edge.targetId
  }
}

export const isConnectedWithPipes = (model: Model, nodeA: NodeId, nodeB?: NodeId | null): boolean => {
  if (!nodeB) {
    return false
  }

  return isConnectedWithPipeOneWay(model, nodeA, nodeB) || isConnectedWithPipeOneWay(model, nodeB, nodeA)
}

const hasOutPipe = (model: Model, nodeId: NodeId): boolean => {
  return nodeId in model.pipesBySourceId
}

const hasInPipe = (model: Model, nodeId: NodeId): boolean => {
  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.targetId === nodeId) {
      return true
    }
  }
  return false
}

export const isProbablyConnectedWithPipes = (model: Model, sourceId: NodeId, targetId: NodeId): boolean => {
  return hasOutPipe(model, sourceId) && hasInPipe(model, targetId)
}

export const isSolved = (model: Model): boolean => {
  for (const terminal of yieldTerminals(model)) {
    if (!terminal.endId) {
      continue
    }
    if (!isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
      return false
    }
  }
  return true
}

export const countConnectedPipes = (model: Model): number => {
  let count = 0
  for (const terminal of yieldTerminals(model)) {
    if (!terminal.endId) {
      continue
    }
    if (isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
      count++
    }
  }
  return count
}

export const isTerminalConnectedWithPipes = (model: Model, groupId: GroupId): boolean => {
  const terminal = toTerminalByGroupId(model, groupId)
  if (!terminal) {
    return false
  }
  return isConnectedWithPipes(model, terminal.startId, terminal.endId)
}

export const hasInwardPipe = (model: Model, nodeId: NodeId): boolean => {
  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.targetId === nodeId) {
      return true
    }
  }
  return false
}

export const hasOutwardPipe = (model: Model, nodeId: NodeId): boolean => {
  for (const pipe of yieldPipes(model)) {
    if (pipe.edge.sourceId === nodeId) {
      return true
    }
  }
  return false
}

export const hasBranchingPipelines = (model: Model): boolean => {
  for (const terminal of yieldTerminals(model)) {
    const isStartBranching = hasInwardPipe(model, terminal.startId) && hasOutwardPipe(model, terminal.startId)
    if (isStartBranching) {
      return true
    }
    const isEndBranching = terminal.endId
      ? hasInwardPipe(model, terminal.endId) && hasOutwardPipe(model, terminal.endId)
      : false
    if (isEndBranching) {
      return true
    }

    const isBothInward = terminal.endId
      ? hasInwardPipe(model, terminal.startId) && hasInwardPipe(model, terminal.endId)
      : false

    if (isBothInward) {
      return true
    }

    const isBothOutward = terminal.endId
      ? hasOutwardPipe(model, terminal.startId) && hasOutwardPipe(model, terminal.endId)
      : false

    if (isBothOutward) {
      return true
    }
  }
  return false
}

export const hasMultipleDeadEndPipelines = (model: Model): boolean => {
  const targetFrequencies: { [nodeId: string]: number } = {}
  const sourceFrequencies: { [nodeId: string]: number } = {}
  for (const pipe of yieldPipes(model)) {
    targetFrequencies[pipe.edge.targetId] = (targetFrequencies[pipe.edge.targetId] ?? 0) + 1
    if ((targetFrequencies[pipe.edge.targetId] ?? 0) > 1) {
      return true
    }

    sourceFrequencies[pipe.edge.sourceId] = (sourceFrequencies[pipe.edge.sourceId] ?? 0) + 1
    if ((sourceFrequencies[pipe.edge.sourceId] ?? 0) > 1) {
      return true
    }
  }
  return false
}

/**
 * Removes all pipes that are part of the pipeline with the inputted group id
 */
export const removePipeline = (model: Model, groupId?: GroupId | null): Model => {
  const pipesBySourceId: Model['pipesBySourceId'] = {}

  for (const pipe of yieldPipes(model)) {
    if (pipe.groupId === groupId) {
      continue
    }
    pipesBySourceId[pipe.edge.sourceId] = {
      edgeId: pipe.edgeId,
      groupId: pipe.groupId,
    }
  }

  return {
    ...model,
    pipesBySourceId,
  }
}

const pipelineToPipesBySourceId = (model: Model, pipeline: Pipeline): { [sourceId: NodeId]: Pipe } => {
  const pipsBySourceId: { [sourceId: NodeId]: Pipe } = {}

  for (const pipe of pipeline) {
    const edge = toEdge(model, pipe.edgeId)
    if (!edge) {
      continue
    }
    pipsBySourceId[edge.sourceId] = pipe
  }

  return pipsBySourceId
}

const arePipesOverlapping = (model: Model, pipeA: Pipe, pipeB: Pipe): boolean => {
  const edgePipeA = toEdge(model, pipeB.edgeId)
  const edgePipeB = toEdge(model, pipeA.edgeId)
  if (!edgePipeA || !edgePipeB) {
    return false
  }
  return edgePipeA.sourceId === edgePipeB.sourceId || edgePipeA.targetId === edgePipeB.targetId
}

const removeOverlappingPipes = (model: Model, newPipeline: Pipeline): Model => {
  const pipesBySourceIdNew: Model['pipesBySourceId'] = {}

  for (const existingPipe of Object.values(model.pipesBySourceId)) {
    const existingPipeEdge = toEdge(model, existingPipe.edgeId)

    if (!existingPipeEdge) {
      continue
    }

    const isExistingOverlappingNew = newPipeline.some((newPipe) => arePipesOverlapping(model, existingPipe, newPipe))

    if (isExistingOverlappingNew) {
      continue
    }

    pipesBySourceIdNew[existingPipeEdge.sourceId] = existingPipe
  }

  return { ...model, pipesBySourceId: pipesBySourceIdNew }
}

/**
 * Adds all pipes that are part of the pipeline with the inputted group id
 */
export const addPipeline = (model: Model, newPipeline: Pipeline): Model => {
  const pipelineStart = newPipeline[0]

  if (!pipelineStart) {
    return model
  }

  const terminal = toTerminalByGroupId(model, pipelineStart.groupId)

  if (!terminal) {
    return model
  }

  const pipelineStartEdge = toEdge(model, pipelineStart.edgeId)

  const terminalFinal = terminal.startId === pipelineStartEdge?.sourceId ? terminal : Terminal.flip(terminal)

  const removedInvalidPipes = pipe(
    model,
    (model) => removePipeline(model, pipelineToGroupId(newPipeline)),
    (model) => removeOverlappingPipes(model, newPipeline),
  )

  const pipesBySourceIdNew = pipelineToPipesBySourceId(model, newPipeline)

  const modelNew: Model = {
    ...removedInvalidPipes,
    terminalsByGroupId: {
      ...removedInvalidPipes.terminalsByGroupId,
      [terminalFinal.groupId]: terminalFinal,
    },
    pipesBySourceId: {
      ...removedInvalidPipes.pipesBySourceId,
      ...pipesBySourceIdNew,
    },
  }

  return modelNew
}

export const removeAllPipelines = <TModel extends Model>(model: TModel): TModel => {
  return {
    ...model,
    pipesBySourceId: {},
  }
}

export const isPipesEmpty = (model: Model): boolean => {
  return Object.keys(model.pipesBySourceId).length === 0
}

export const toTargetId = (model: Model, edgeId: EdgeId): NodeId | null => {
  const edge = toEdge(model, edgeId)
  if (!edge) {
    return null
  }
  return edge.targetId
}
