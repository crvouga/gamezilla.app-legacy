import { p } from '~/@/core/parser'
import { Flow } from '../../flow'
import { FlowGroupId } from '../../flow/flow-group-id'
import * as FlowGridDimensions from './flow-grid-dimensions'
import { Position } from './flow-grid-position'
import { FlowNodeId } from '../../flow/flow-node-id'
import { FlowEdgeId } from '../../flow/flow-edge-id'
import { FlowTerminal } from '../../flow/flow-terminal'

//
//
//
// Model
//
//
//

export const Model = p.and(
  Flow.Model,
  FlowGridDimensions.Model,
  p.obj({
    t: p.l('flow-grid'),
    positions: p.dict(FlowNodeId, Position.parser)
  })
)
export type Model = p.Infer<typeof Model>

const initNodeId = (x: number, y: number): FlowNodeId => {
  return FlowNodeId.init(`${x},${y}`)
}

export const toNodeId = (position: Position): FlowNodeId => {
  return initNodeId(position.x, position.y)
}

export const distance = (model: Model, a: FlowNodeId, b: FlowNodeId): number => {
  const positionA = model.positions[a]

  if (!positionA) {
    return Number.POSITIVE_INFINITY
  }

  const positionB = model.positions[b]

  if (!positionB) {
    return Number.POSITIVE_INFINITY
  }

  return Position.manhattanDistance(positionA, positionB)
}

//
//
//
// Init
//
//
//

export const init = (input: {
  dimensions: FlowGridDimensions.Model
  terminalsByGroupId?: Flow.Model['terminalsByGroupId']
  pipesBySourceId?: Flow.Model['pipesBySourceId']
}): Model => {
  const model: Model = {
    t: 'flow-grid',
    width: input.dimensions.width,
    height: input.dimensions.height,
    positions: {},
    edges: {},
    edgeHash: null,
    nodeHash: null,
    Flow: true,
    nodes: {},
    terminalsByGroupId: {},
    pipesBySourceId: input.pipesBySourceId ?? {}
  }
  //
  //
  //
  //
  const width = input.dimensions.width
  const height = input.dimensions.height
  const maxX = width - 1
  const maxY = height - 1
  let x: number
  let y: number

  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      const nodeId = initNodeId(x, y)
      model.positions[nodeId] = {
        x,
        y
      }
      model.nodes[nodeId] = {
        nodeId
      }

      if (y > 0) {
        const north = initNodeId(x, y - 1)
        const edgeNorth: Flow.Edge = {
          sourceId: nodeId,
          targetId: north
        }
        model.edges[Flow.toFlowEdgeId(edgeNorth)] = edgeNorth
      }

      if (x < maxX) {
        const east = initNodeId(x + 1, y)
        const edgeEast: Flow.Edge = {
          sourceId: nodeId,
          targetId: east
        }
        model.edges[Flow.toFlowEdgeId(edgeEast)] = edgeEast
      }

      if (y < maxY) {
        const south = initNodeId(x, y + 1)
        const edgeSouth: Flow.Edge = {
          sourceId: nodeId,
          targetId: south
        }
        model.edges[Flow.toFlowEdgeId(edgeSouth)] = edgeSouth
      }

      if (x > 0) {
        const west = initNodeId(x - 1, y)
        const edgeWest: Flow.Edge = {
          sourceId: nodeId,
          targetId: west
        }
        model.edges[Flow.toFlowEdgeId(edgeWest)] = edgeWest
      }
    }
  }
  //
  // Terminals
  //

  for (const groupId in input.terminalsByGroupId) {
    const terminal = input.terminalsByGroupId[groupId as FlowGroupId]

    if (!terminal) {
      continue
    }

    const start = model.nodes[terminal.startId]

    const end = terminal?.endId ? model.nodes[terminal.endId] : null

    const startNew = start?.nodeId ?? end?.nodeId

    if (!startNew) {
      continue
    }

    const endNew = end?.nodeId === startNew ? null : end?.nodeId

    const terminalNew: FlowTerminal = {
      groupId: terminal.groupId,
      startId: startNew,
      endId: endNew
    }

    model.terminalsByGroupId[terminalNew.groupId] = terminalNew
  }

  model.edgeHash = Flow.deriveEdgeHash(model.edges)
  model.nodeHash = Flow.deriveNodeHash(model.nodes)

  return model
}

//
//
//
// Accessors
//
//
//

export type Node = Flow.Node & Position

export type Edge = Flow.Edge & {
  source: Node
  target: Node
}

export const toNode = (model: Model, nodeId: FlowNodeId): Node | null => {
  const node = Flow.toNode(model, nodeId)

  if (!node) {
    return null
  }

  const position = model.positions[node.nodeId]

  if (!position) {
    return null
  }

  return {
    ...position,
    ...node
  }
}

export const toEdge = (model: Model, edgeId: FlowEdgeId): Edge | null => {
  const edge = Flow.toEdge(model, edgeId)

  if (!edge) {
    return null
  }

  const source = toNode(model, edge.sourceId)

  if (!source) {
    return null
  }

  const target = toNode(model, edge.targetId)

  if (!target) {
    return null
  }

  return {
    ...edge,
    source: source,
    target: target
  }
}

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, position: Position): Model => {
  const nodeId = toNodeId(position)
  const added = Flow.addNode(model, { nodeId })
  return {
    ...model,
    ...added,
    positions: {
      ...model.positions,
      [nodeId]: position
    }
  }
}

export const yieldPositions = function* (model: Model): Generator<Position> {
  for (const node of Flow.yieldNodes(model)) {
    const position = model.positions[node.nodeId]
    if (!position) {
      continue
    }
    yield position
  }
}

export const yieldEdges = function* (model: Model): Generator<Edge> {
  for (const edge of Flow.yieldEdges(model)) {
    const source = toNode(model, edge.sourceId)

    if (!source) {
      continue
    }

    const target = toNode(model, edge.targetId)

    if (!target) {
      continue
    }

    yield { ...edge, source, target }
  }
}

export const yieldNodes = function* (model: Model): Generator<Node> {
  for (const node of Flow.yieldNodes(model)) {
    const position = model.positions[node.nodeId]
    if (!position) {
      continue
    }
    yield { ...position, ...node }
  }
}

export type Terminal = FlowTerminal & {
  start: Node
  end?: Node | null
}

export const yieldTerminals = function* (model: Model): Generator<Terminal> {
  for (const terminal of Flow.yieldTerminals(model)) {
    const start = toNode(model, terminal.startId)

    if (!start) {
      continue
    }

    const end = terminal.endId ? toNode(model, terminal.endId) ?? null : null

    yield { ...terminal, start, end }
  }
}

export type PipeJoined = Flow.PipeJoined & {
  source: Node
  target: Node
}

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
  for (const pipe of Flow.yieldPipes(model)) {
    const source = toNode(model, pipe.edge.sourceId)

    if (!source) {
      continue
    }

    const target = toNode(model, pipe.edge.targetId)

    if (!target) {
      continue
    }

    yield {
      ...pipe,
      source,
      target
    }
  }
}

export const yieldPipelines = function* (model: Model): Iterable<Iterable<PipeJoined>> {
  for (const terminal of Flow.yieldTerminals(model)) {
    yield toPipeline(model, terminal.startId)
  }
}

const pipeToPipeJoined = (model: Model, pipe: Flow.Pipe): PipeJoined[] => {
  const edge = Flow.toEdge(model, pipe.edgeId)

  if (!edge) {
    return []
  }

  const source = toNode(model, edge.sourceId)

  if (!source) {
    return []
  }

  const target = toNode(model, edge.targetId)

  if (!target) {
    return []
  }

  return [{ ...pipe, source, target, edge }]
}

export const toPipeline = (model: Model, startingNodeId: FlowNodeId): PipeJoined[] => {
  const USE_V2 = true
  if (USE_V2) {
    const pipeline = Flow.toPipeline(model, startingNodeId)
    const pipelineJoined = pipeline.flatMap((pipe) => pipeToPipeJoined(model, pipe))
    return pipelineJoined
  }
  const pipeline: PipeJoined[] = []

  let currentNodeId = startingNodeId
  const visited = new Set<FlowNodeId>()

  while (true) {
    if (visited.has(currentNodeId)) {
      return pipeline
    }
    visited.add(currentNodeId)
    const pipe = Flow.toPipeBySourceId(model, currentNodeId)

    if (!pipe) {
      return pipeline
    }

    const source = toNode(model, pipe.edge.sourceId)

    if (!source) {
      return pipeline
    }

    const target = toNode(model, pipe.edge.targetId)

    if (!target) {
      return pipeline
    }

    pipeline.push({
      ...pipe,
      source,
      target
    })

    currentNodeId = pipe.edge.targetId
  }
}
