import { ascend } from '~/@/array/sorting'
import { MinHeap } from '~/@/min-heap/min-heap'
import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'
import { Variant } from '../../variant'
import { AlgoIsSolved } from '../algo-is-solved/algo-is-solved'
import { TerminalFull } from '../../flow/terminal-full'

export const solve = (model: Variant.Model): Variant.Model | null => {
  for (const solution of solutions(model)) {
    return solution
  }
  return null
}

export const solutions = function* (model: Variant.Model): Iterable<Variant.Model> {
  const cleared = Flow.removeAllPipelines(model)
  const disconnectedTerminals = Flow.toFullTerminals(cleared)

  disconnectedTerminals.sort(ascend((terminal) => toTerminalDistance(cleared, terminal)))

  yield* solveStep(cleared, disconnectedTerminals)
}

const solveStep = function* (model: Variant.Model, disconnectedTerminals: TerminalFull[]): Iterable<Variant.Model> {
  if (isImpossibleForTerminalsToConnect(model, disconnectedTerminals)) {
    return
  }

  if (AlgoIsSolved.isSolved(model)) {
    yield model
    return
  }

  const [terminal, ...rest] = disconnectedTerminals

  if (!terminal) return

  const allPossiblePipelines = toAllPossiblePipelines(model, terminal.groupId, terminal.startId, terminal.endId)

  for (const possiblePipeline of allPossiblePipelines) {
    const drew = drawPipeline(model, terminal, possiblePipeline)
    yield* solveStep(drew, rest)
  }
}

const isImpossibleForTerminalsToConnect = (model: Variant.Model, terminals: TerminalFull[]): boolean => {
  for (const terminal of terminals) {
    if (
      isSurroundedByDifferentGroup(model, terminal.groupId, terminal.startId) ||
      isSurroundedByDifferentGroup(model, terminal.groupId, terminal.endId)
    ) {
      return true
    }
  }
  return false
}

const isSurroundedByDifferentGroup = (model: Variant.Model, groupId: GroupId, nodeId: NodeId): boolean => {
  const neighbors = Array.from(Flow.yieldEdgesOut(model, nodeId)).map((edgeOut) => edgeOut.targetId)
  const neighborGroupIds = neighbors.map((neighborId) => Flow.toGroupId(model, neighborId))
  return neighborGroupIds.every((neighborGroupId) => neighborGroupId !== groupId && neighborGroupId !== null)
}

const MAX_ITERATIONS = 5000

const toAllPossiblePipelines = function* (
  model: Variant.Model,
  groupId: GroupId,
  startId: NodeId,
  endId: NodeId,
): Iterable<Flow.Edge[]> {
  type HeapItem = {
    path: Flow.Edge[]
    currentNode: NodeId
    visited: Set<NodeId>
    cost: number
    heuristic: number
  }

  const minHeap = new MinHeap<HeapItem>((a, b) => a.heuristic - b.heuristic)
  const visitedPaths = new Set<string>()
  let iterations = 0

  minHeap.insert({
    path: [],
    currentNode: startId,
    visited: new Set([startId]),
    cost: 0,
    heuristic: Variant.distance(model, startId, endId),
  })

  while (!minHeap.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++
    const min = minHeap.extractMin()

    if (!min) {
      break
    }

    const { path, currentNode, visited, cost } = min

    if (currentNode === endId) {
      const normalizedPath = normalizePath(path)
      if (!visitedPaths.has(normalizedPath)) {
        visitedPaths.add(normalizedPath)
        yield path
      }
      continue
    }

    for (const edgeOut of Flow.yieldEdgesOut(model, currentNode)) {
      const targetGroupId = Flow.toGroupId(model, edgeOut.targetId)

      if (targetGroupId && targetGroupId !== groupId) {
        continue
      }

      if (visited.has(edgeOut.targetId)) {
        continue
      }

      const newPath = [...path, edgeOut]
      const newVisited = new Set(visited).add(edgeOut.targetId)
      const newCost = cost + 1
      const heuristic = toHeuristic(model, edgeOut.targetId, endId, newPath)

      minHeap.insert({
        path: newPath,
        currentNode: edgeOut.targetId,
        visited: newVisited,
        cost: newCost,
        heuristic,
      })
    }
  }
}

const drawPipeline = (model: Variant.Model, terminal: Terminal, path: Flow.Edge[]): Variant.Model => {
  const pipesBySourceId = { ...model.pipesBySourceId }

  for (const edge of path) {
    pipesBySourceId[edge.sourceId] = {
      edgeId: Flow.toEdgeId(edge),
      groupId: terminal.groupId,
    }
  }

  return {
    ...model,
    pipesBySourceId,
  }
}

const toTerminalDistance = (model: Variant.Model, terminal: Terminal): number => {
  if (!terminal.endId) {
    return Number.POSITIVE_INFINITY
  }
  return Variant.distance(model, terminal.startId, terminal.endId)
}

const toDirection = (model: Variant.Model, sourceId: NodeId, targetId: NodeId): string => {
  const distance = Variant.distance(model, sourceId, targetId)
  return `${sourceId}${targetId}${distance}`
}

const countTurns = (model: Variant.Model, path: Flow.Edge[]): number => {
  let turns = 0
  let prevDirection = ''
  for (let i = 0; i < path.length; i++) {
    const curr = path[i]
    if (!curr) continue
    const currDirection = toDirection(model, curr.sourceId, curr.targetId)
    if (prevDirection && prevDirection !== currDirection) {
      turns++
    }
    prevDirection = currDirection
  }
  return turns
}

const toHeuristic = (model: Variant.Model, currentNode: NodeId, endNode: NodeId, path: Flow.Edge[]): number => {
  const distanceHeuristic = Variant.distance(model, currentNode, endNode)
  const turnsHeuristic = countTurns(model, path)
  return distanceHeuristic + turnsHeuristic * 1.5
}

const normalizePath = (path: Flow.Edge[]): string => {
  return path.map((edge) => `${edge.sourceId}-${edge.targetId}`).join(',')
}
