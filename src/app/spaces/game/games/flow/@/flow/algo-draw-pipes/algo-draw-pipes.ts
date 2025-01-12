import { pipe } from '~/@/function/pipe'
import { MinHeap } from '~/@/min-heap/min-heap'
import { Flow } from '../../flow'
import { Variant } from '../../variant'
import { EdgeId } from '../../flow/edge-id'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'

/**
 * A `Pipeline` represents the sequence of nodes the user draws when connecting terminals.
 */
type Pipeline = NodeId[]

/**
 * Starts
 */
export const startDrawPipes = (model: Variant.Model, groupId: GroupId, newNodeId: NodeId): Flow.Model => {
  const terminal = Flow.toTerminalByGroupId(model, groupId)

  if (!terminal) {
    return model
  }

  if (terminal.endId === newNodeId) {
    const reversed = Flow.flipTerminal(model, terminal)

    const drew = drawPipes(reversed, groupId, newNodeId)

    return drew
  }

  const drew = drawPipes(model, groupId, newNodeId)

  return drew
}

/**
 * Algorithm that draws pipes from the inputted group id to the inputted node id
 */
export const drawPipes = (model: Variant.Model, groupId: GroupId, nodeIdNew: NodeId): Flow.Model => {
  const newNodeGroupId = Flow.findGroupIdByNodeId(model, nodeIdNew)

  if (newNodeGroupId && newNodeGroupId !== groupId) {
    return model
  }

  const terminal = Flow.toTerminalByGroupId(model, groupId)

  if (!terminal) {
    return model
  }

  if (!newNodeGroupId && isTerminalConnected(model, terminal)) {
    return model
  }

  const existingPipeline = findPipeline(model, terminal.groupId, terminal.startId)

  const pipelineNew = pipe(
    existingPipeline,

    (pipeline) => takeWhile(pipeline, (nodeId) => nodeId !== nodeIdNew && nodeId !== terminal.endId),

    (pipeline) => [...pipeline, nodeIdNew],

    (pipeline) => takeWhileConnected(model, pipeline),

    (pipeline) => {
      const startNodeId = pipeline[pipeline.length - 1]

      if (!startNodeId) {
        return pipeline
      }

      const shortest = findShortestEmptyPipelineAStar(
        (nodeId) => 1 - 1 / Variant.distance(model, nodeId, nodeIdNew),
        model,
        startNodeId,
        nodeIdNew,
      )

      const pipelineNew = [...pipeline, ...shortest.slice(1)]

      return pipelineNew
    },
  )

  const added = addPipeline(Flow.removePipeline(model, groupId), terminal, pipelineNew)

  return added
}

/**
 * Takes nodes in order from the inputted pipeline until a node are no longer connected to the previous node
 */
const takeWhileConnected = (model: Flow.Model, pipeline: Pipeline): Pipeline => {
  const pipelineNew: Pipeline = []

  for (let i = 0; i < pipeline.length; i++) {
    const currNode = pipeline[i]

    if (!currNode) {
      continue
    }

    const prevNode = pipelineNew[pipelineNew.length - 1]

    if (!prevNode) {
      pipelineNew.push(currNode)
      continue
    }

    if (Flow.hasEdge(model, prevNode, currNode)) {
      pipelineNew.push(currNode)
      continue
    }

    break
  }
  return pipelineNew
}

/**
 *
 */
const isTerminalConnected = (model: Flow.Model, terminal: Terminal): boolean => {
  let currentId = terminal.startId

  while (true) {
    if (currentId === terminal.endId) {
      return true
    }

    const pipe = Flow.toPipeBySourceId(model, currentId)

    if (!pipe) {
      return false
    }

    if (pipe.groupId !== terminal.groupId) {
      return false
    }

    currentId = pipe.edge.targetId
  }
}

/**
 * Returns a pipeline for inputted group id starting from inputted node id
 */
const findPipeline = (model: Flow.Model, groupId: GroupId, initial: NodeId): Pipeline => {
  const pipeline: Pipeline = []
  let currentId = initial

  while (true) {
    pipeline.push(currentId)

    const pipe = Flow.toPipeBySourceId(model, currentId)

    if (!pipe) {
      break
    }

    if (pipe.groupId !== groupId) {
      break
    }

    currentId = pipe.edge.targetId
  }

  return pipeline
}

/**
 * Adds all pipes that are part of the pipeline with the inputted group id
 */
const addPipeline = (model: Flow.Model, terminal: Terminal, pipeline: Pipeline): Flow.Model => {
  const modelNew: Flow.Model = { ...model }

  for (let i = 0; i < pipeline.length - 1; i++) {
    const first = pipeline[i]

    if (!first) {
      break
    }

    const second = pipeline[i + 1]

    if (!second) {
      break
    }

    const edge: Flow.Edge = {
      sourceId: first,
      targetId: second,
    }

    if (!Flow.hasEdge(modelNew, first, second)) {
      continue
    }

    const pipeNew: Flow.Pipe = {
      edgeId: Flow.toEdgeId(edge),
      groupId: terminal.groupId,
    }

    modelNew.pipesBySourceId[edge.sourceId] = pipeNew
  }

  return modelNew
}

/**
 * Returns a list of nodes without a groupId that form the shortest path between the source and target nodes.
 */
export const _findShortestEmptyPipelineBFS = (model: Flow.Model, sourceId: NodeId, targetId: NodeId): NodeId[] => {
  const sourceGroupId = Flow.findGroupIdByNodeId(model, sourceId)

  if (!sourceGroupId) {
    return []
  }

  const terminal = Flow.toTerminalByGroupId(model, sourceGroupId)

  //
  //
  //  Construct the breadth first tree
  //
  //

  const queue: NodeId[] = []
  const visited = new Set<NodeId>()
  const tree: { [id: NodeId]: { parent?: NodeId } } = {}

  visited.add(sourceId)
  queue.push(sourceId)

  while (true) {
    const currentId = queue.shift()

    if (!currentId) {
      break
    }

    visited.add(currentId)

    if (currentId === targetId) {
      break
    }

    if (currentId === terminal?.endId) {
      break
    }

    for (const outEdge of Flow.yieldEdgesOut(model, currentId)) {
      const adjacentId = outEdge.targetId

      if (visited.has(adjacentId)) {
        continue
      }

      const adjacentPipe = Flow.findPipeByNodeId(model, adjacentId)

      if (adjacentPipe) {
        continue
      }

      const adjacentTerminal = Flow.findTerminalByNodeId(model, adjacentId)

      if (adjacentTerminal && adjacentTerminal.groupId !== sourceGroupId) {
        continue
      }

      queue.push(adjacentId)
      tree[adjacentId] = {
        parent: currentId,
      }
    }
  }

  // Construct the path from the breadth first tree

  let current = targetId
  const nodePath: NodeId[] = [current]

  while (current !== sourceId) {
    const parent = tree[current]?.parent

    if (!parent) {
      break
    }

    nodePath.push(parent)
    current = parent
  }

  nodePath.reverse()

  // Convert node path to edge path

  const path: EdgeId[] = []

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i]
    if (!from) {
      continue
    }
    const to = nodePath[i + 1]
    if (!to) {
      continue
    }
    path.push(
      Flow.toEdgeId({
        sourceId: from,
        targetId: to,
      }),
    )
  }

  // Done

  return nodePath
}

//
// This might cause bugs but it's worth a try for perf
//

const gSspace = new Map<NodeId, number>()
const fSspace = new Map<NodeId, number>()
const cameFrom = new Map<NodeId, NodeId>()
const openSet = new MinHeap<NodeId>((a, b) => {
  const fSspaceA = fSspace.get(a) ?? Number.POSITIVE_INFINITY
  const fSspaceB = fSspace.get(b) ?? Number.POSITIVE_INFINITY
  return fSspaceA - fSspaceB
})

const findShortestEmptyPipelineAStar = (
  heuristicSspace: (node: NodeId) => number,
  model: Flow.Model,
  sourceId: NodeId,
  targetId: NodeId,
): NodeId[] => {
  gSspace.clear()
  fSspace.clear()
  cameFrom.clear()
  openSet.clear()

  const sourceGroupId = Flow.findGroupIdByNodeId(model, sourceId)

  if (!sourceGroupId) {
    return []
  }

  gSspace.set(sourceId, 0)
  fSspace.set(sourceId, heuristicSspace(sourceId))
  openSet.insert(sourceId)

  let iterations = 0
  while (true) {
    iterations++
    const current = openSet.extractMin()

    if (!current) {
      break
    }

    if (current === targetId) {
      return reconstructPath(cameFrom, current)
    }

    const currentTerminal = Flow.findTerminalByNodeId(model, current)

    if (currentTerminal) {
      return reconstructPath(cameFrom, current)
    }

    for (const edgeOut of Flow.yieldEdgesOut(model, current)) {
      const adjacent = edgeOut.targetId

      const adjacentPipe = Flow.findPipeByNodeId(model, adjacent)

      if (adjacentPipe) {
        continue
      }

      const adjacentTerminal = Flow.findTerminalByNodeId(model, adjacent)

      if (adjacentTerminal && adjacentTerminal.groupId !== sourceGroupId) {
        continue
      }

      const edgeWeight = 0

      const tentativeGSspace = (gSspace.get(current) ?? Number.POSITIVE_INFINITY) + edgeWeight

      if (tentativeGSspace < (gSspace.get(adjacent) ?? Number.POSITIVE_INFINITY)) {
        cameFrom.set(adjacent, current)
        gSspace.set(adjacent, tentativeGSspace)
        fSspace.set(adjacent, tentativeGSspace + heuristicSspace(adjacent))

        if (!openSet.has(adjacent)) {
          openSet.insert(adjacent)
        }
      }
    }
  }

  return []
}

const reconstructPath = (cameFrom: Map<NodeId, NodeId>, start: NodeId): NodeId[] => {
  let current = start
  const totalPath = [current]

  while (cameFrom.has(current)) {
    const got = cameFrom.get(current)
    if (!got) {
      break
    }
    current = got
    totalPath.push(current)
  }

  return totalPath.reverse()
}

/**
 * Utility function that takes items from the inputted array until the predicate returns false
 */
export const takeWhile = <T>(arr: Iterable<T>, predicate: (item: T) => boolean): T[] => {
  const results: T[] = []
  for (const item of arr) {
    if (!predicate(item)) {
      break
    }
    results.push(item)
  }
  return results
}

export const uniqueWith = <T>(arr: T[], fn: (left: T, right: T) => boolean): T[] => {
  const unique: T[] = []
  for (const left of arr) {
    if (!unique.some((right) => fn(left, right))) {
      unique.push(left)
    }
  }
  return unique
}

export const minAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
  let min = Infinity
  for (const item of arr) {
    const value = fn(item)
    if (value < min) {
      min = value
    }
  }
  return arr.filter((item) => fn(item) === min)
}
