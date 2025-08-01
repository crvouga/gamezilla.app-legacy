import { s } from '~/@/schema'
import { Numberlink } from '../../numberlink'
import { EdgeId } from '../../numberlink/edge-id'
import { GroupId } from '../../numberlink/group-id'
import { NodeId } from '../../numberlink/node-id'
import { Terminal } from '../../numberlink/terminal'
import { VariantGridDimensions } from './grid-dimensions'
import { VariantGridPosition } from './grid-position'

const schema = s.and(
  Numberlink.Model,
  VariantGridDimensions.schema,
  s.obj({
    t: s.l('grid'),
    positions: s.dict(NodeId, VariantGridPosition.schema),
  }),
)
export type VariantGrid = s.Infer<typeof schema>

const initNodeId = (x: number, y: number): NodeId => {
  return NodeId.init(`${x},${y}`)
}

const toNodeId = (position: VariantGridPosition): NodeId => {
  return initNodeId(position.x, position.y)
}

const distance = (model: VariantGrid, a: NodeId, b: NodeId): number => {
  const positionA = model.positions[a]

  if (!positionA) return Number.POSITIVE_INFINITY

  const positionB = model.positions[b]

  if (!positionB) return Number.POSITIVE_INFINITY

  return VariantGridPosition.manhattanDistance(positionA, positionB)
}

//
//
//
// Init
//
//
//

const init = (input: {
  dimensions: VariantGridDimensions
  terminalsByGroupId?: Numberlink.Model['terminalsByGroupId']
  pipesBySourceId?: Numberlink.Model['pipesBySourceId']
}): VariantGrid => {
  const model: VariantGrid = {
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

export type Node = Numberlink.Node & VariantGridPosition

export type Edge = Numberlink.Edge & {
  source: Node
  target: Node
}

const toNode = (model: VariantGrid, nodeId: NodeId): Node | null => {
  const node = Numberlink.toNode(model, nodeId)

  if (!node) return null

  const position = model.positions[node.nodeId]

  if (!position) return null

  return { ...position, ...node }
}

const toEdge = (model: VariantGrid, edgeId: EdgeId): Edge | null => {
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
const addNode = (model: VariantGrid, position: VariantGridPosition): VariantGrid => {
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

const yieldPositions = function* (model: VariantGrid): Generator<VariantGridPosition> {
  for (const node of Numberlink.yieldNodes(model)) {
    const position = model.positions[node.nodeId]
    if (!position) continue
    yield position
  }
}

const yieldEdges = function* (model: VariantGrid): Generator<Edge> {
  for (const edge of Numberlink.yieldEdges(model)) {
    const source = toNode(model, edge.sourceId)

    if (!source) continue

    const target = toNode(model, edge.targetId)

    if (!target) continue

    yield { ...edge, source, target }
  }
}

const yieldNodes = function* (model: VariantGrid): Generator<Node> {
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

const yieldTerminals = function* (model: VariantGrid): Generator<GridTerminal> {
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

const yieldPipes = function* (model: VariantGrid): Generator<PipeJoined> {
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

const yieldPipelines = function* (model: VariantGrid): Iterable<Iterable<PipeJoined>> {
  for (const terminal of Numberlink.yieldTerminals(model)) {
    yield toPipeline(model, terminal.startId)
  }
}

const pipeToPipeJoined = (model: VariantGrid, pipe: Numberlink.Pipe): PipeJoined[] => {
  const edge = Numberlink.toEdge(model, pipe.edgeId)

  if (!edge) return []

  const source = toNode(model, edge.sourceId)

  if (!source) return []

  const target = toNode(model, edge.targetId)

  if (!target) return []

  return [{ ...pipe, source, target, edge }]
}

const toPipeline = (model: VariantGrid, startingNodeId: NodeId): PipeJoined[] => {
  const pipeline = Numberlink.toPipeline(model, startingNodeId)
  const pipelineJoined = pipeline.flatMap((pipe) => pipeToPipeJoined(model, pipe))
  return pipelineJoined
}

const toDimensions = (model: VariantGrid): VariantGridDimensions => {
  return {
    t: 'grid',
    width: model.width,
    height: model.height,
  }
}

export const VariantGrid = {
  schema,
  toNodeId,
  distance,
  init,
  toNode,
  toEdge,
  addNode,
  yieldPositions,
  yieldEdges,
  yieldNodes,
  yieldTerminals,
  yieldPipes,
  yieldPipelines,
  toPipeline,
  toDimensions,
}
