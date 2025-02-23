import { ascend } from '~/@/array/sorting'
import { MinHeap } from '~/@/min-heap/min-heap'
import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { Terminal } from '../../flow/terminal'
import { Variant } from '../../variant'
import { AlgoIsSolved } from '../algo-is-solved/algo-is-solved'

export const solve = (model: Variant.Model): Variant.Model | null => {
  for (const solution of solutions(model)) {
    return solution
  }
  return null
}

export const solutions = function* (model: Variant.Model): Iterable<Variant.Model> {
  const cleared = Flow.removeAllPipelines(model)
  const disconnectedTerminals = Flow.toTerminals(cleared)

  disconnectedTerminals.sort(ascend((terminal) => toTerminalDistance(cleared, terminal)))

  yield* solveStep(cleared, disconnectedTerminals)
}

const solveStep = function* (model: Variant.Model, disconnectedTerminals: Terminal[]): Iterable<Variant.Model> {
  if (AlgoIsSolved.isSolved(model)) {
    yield model
    return
  }

  const terminal = disconnectedTerminals[0]

  if (!terminal || !terminal.endId) return

  const possiblePipelines = toPossiblePipelines(model, terminal.groupId, terminal.startId, terminal.endId)

  const disconnectedTerminalsRest = disconnectedTerminals.slice(1)

  for (const possiblePipeline of possiblePipelines) {
    const drew = drawPipeline(model, terminal, possiblePipeline)
    yield* solveStep(drew, disconnectedTerminalsRest)
  }
}

// const MAX_ITERATIONS = 5000;

const toPossiblePipelines = function* (
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

  minHeap.insert({
    path: [],
    currentNode: startId,
    visited: new Set([startId]),
    cost: 0,
    heuristic: Variant.distance(model, startId, endId),
  })

  while (!minHeap.isEmpty()) {
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
