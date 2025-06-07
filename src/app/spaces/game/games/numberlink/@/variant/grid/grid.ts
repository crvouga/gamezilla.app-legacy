import { s } from '~/@/schema'
import { Numberlink } from '../../numberlink'
import { EdgeId } from '../../numberlink/edge-id'
import { GroupId } from '../../numberlink/group-id'
import { NodeId } from '../../numberlink/node-id'
import { Terminal } from '../../numberlink/terminal'
import * as VariantGridDimensions from './grid-dimensions'
import { Position } from './grid-position'

//
//
//
// Model
//
//
//

export const Model = s.and(
  Numberlink.Model,
  VariantGridDimensions.Model,
  s.obj({
    t: s.l('grid'),
    positions: s.dict(NodeId, Position.schema),
  }),
)
export type Model = s.Infer<typeof Model>

const initNodeId = (x: number, y: number): NodeId => {
  return NodeId.init(`${x},${y}`)
}

export const toNodeId = (position: Position): NodeId => {
  return initNodeId(position.x, position.y)
}

export const distance = (model: Model, a: NodeId, b: NodeId): number => {
  const positionA = model.positions[a]

  if (!positionA) return Number.POSITIVE_INFINITY

  const positionB = model.positions[b]

  if (!positionB) return Number.POSITIVE_INFINITY

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
  dimensions: VariantGridDimensions.Model
  terminalsByGroupId?: Numberlink.Model['terminalsByGroupId']
  pipesBySourceId?: Numberlink.Model['pipesBySourceId']
}): Model => {
  const model: Model = {
    t: 'grid',
    width: input.dimensions.width,
    height: input.dimensions.height,
    positions: {},
    edges: {},
    edgeHash: null,
    nodeHash: null,
    terminalHash: null,
    Flow: true,
    nodes: {},
    terminalsByGroupId: {},
    pipesBySourceId: input.pipesBySourceId ?? {},
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
        y,
      }
      model.nodes[nodeId] = {
        nodeId,
      }

      if (y > 0) {
        const north = initNodeId(x, y - 1)
        const edgeNorth: Numberlink.Edge = {
          sourceId: nodeId,
          targetId: north,
        }
        model.edges[Numberlink.toEdgeId(edgeNorth)] = edgeNorth
      }

      if (x < maxX) {
        const east = initNodeId(x + 1, y)
        const edgeEast: Numberlink.Edge = {
          sourceId: nodeId,
          targetId: east,
        }
        model.edges[Numberlink.toEdgeId(edgeEast)] = edgeEast
      }

      if (y < maxY) {
        const south = initNodeId(x, y + 1)
        const edgeSouth: Numberlink.Edge = {
          sourceId: nodeId,
          targetId: south,
        }
        model.edges[Numberlink.toEdgeId(edgeSouth)] = edgeSouth
      }

      if (x > 0) {
        const west = initNodeId(x - 1, y)
        const edgeWest: Numberlink.Edge = {
          sourceId: nodeId,
          targetId: west,
        }
        model.edges[Numberlink.toEdgeId(edgeWest)] = edgeWest
      }
    }
  }
  //
  // Terminals
  //

  for (const groupId in input.terminalsByGroupId) {
    const terminal = input.terminalsByGroupId[groupId as GroupId]

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

    const terminalNew: Terminal = {
      groupId: terminal.groupId,
      startId: startNew,
      endId: endNew,
    }

    model.terminalsByGroupId[terminalNew.groupId] = terminalNew
  }

  model.edgeHash = Numberlink.deriveEdgeHash(model.edges)
  model.nodeHash = Numberlink.deriveNodeHash(model.nodes)

  return model
}

//
//
//
// Accessors
//
//
//

export type Node = Numberlink.Node & Position

export type Edge = Numberlink.Edge & {
  source: Node
  target: Node
}

export const toNode = (model: Model, nodeId: NodeId): Node | null => {
  const node = Numberlink.toNode(model, nodeId)

  if (!node) return null

  const position = model.positions[node.nodeId]

  if (!position) return null

  return { ...position, ...node }
}

export const toEdge = (model: Model, edgeId: EdgeId): Edge | null => {
  const edge = Numberlink.toEdge(model, edgeId)

  if (!edge) return null

  const source = toNode(model, edge.sourceId)

  if (!source) return null

  const target = toNode(model, edge.targetId)

  if (!target) return null

  return { ...edge, source, target }
}

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, position: Position): Model => {
  const nodeId = toNodeId(position)
  const added = Numberlink.addNode(model, { nodeId })
  return {
    ...model,
    ...added,
    positions: {
      ...model.positions,
      [nodeId]: position,
    },
  }
}

export const yieldPositions = function* (model: Model): Generator<Position> {
  for (const node of Numberlink.yieldNodes(model)) {
    const position = model.positions[node.nodeId]
    if (!position) continue
    yield position
  }
}

export const yieldEdges = function* (model: Model): Generator<Edge> {
  for (const edge of Numberlink.yieldEdges(model)) {
    const source = toNode(model, edge.sourceId)

    if (!source) continue

    const target = toNode(model, edge.targetId)

    if (!target) continue

    yield { ...edge, source, target }
  }
}

export const yieldNodes = function* (model: Model): Generator<Node> {
  for (const node of Numberlink.yieldNodes(model)) {
    const position = model.positions[node.nodeId]
    if (!position) continue
    yield { ...position, ...node }
  }
}

export type GridTerminal = Terminal & {
  start: Node
  end?: Node | null
}

export const yieldTerminals = function* (model: Model): Generator<GridTerminal> {
  for (const terminal of Numberlink.yieldTerminals(model)) {
    const start = toNode(model, terminal.startId)

    if (!start) continue

    const end = terminal.endId ? (toNode(model, terminal.endId) ?? null) : null

    yield { ...terminal, start, end }
  }
}

export type PipeJoined = Numberlink.PipeJoined & {
  source: Node
  target: Node
}

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
  for (const pipe of Numberlink.yieldPipes(model)) {
    const source = toNode(model, pipe.edge.sourceId)

    if (!source) continue

    const target = toNode(model, pipe.edge.targetId)

    if (!target) continue

    yield {
      ...pipe,
      source,
      target,
    }
  }
}

export const yieldPipelines = function* (model: Model): Iterable<Iterable<PipeJoined>> {
  for (const terminal of Numberlink.yieldTerminals(model)) {
    yield toPipeline(model, terminal.startId)
  }
}

const pipeToPipeJoined = (model: Model, pipe: Numberlink.Pipe): PipeJoined[] => {
  const edge = Numberlink.toEdge(model, pipe.edgeId)

  if (!edge) return []

  const source = toNode(model, edge.sourceId)

  if (!source) return []

  const target = toNode(model, edge.targetId)

  if (!target) return []

  return [{ ...pipe, source, target, edge }]
}

export const toPipeline = (model: Model, startingNodeId: NodeId): PipeJoined[] => {
  const pipeline = Numberlink.toPipeline(model, startingNodeId)
  const pipelineJoined = pipeline.flatMap((pipe) => pipeToPipeJoined(model, pipe))
  return pipelineJoined
}

export const toDimensions = (model: Model): VariantGridDimensions.Model => {
  return {
    t: 'grid',
    width: model.width,
    height: model.height,
  }
}
