import { MinHeap } from '~/@/min-heap/min-heap'
import { Flow } from '../../flow'
import { GroupId } from '../../flow/group-id'
import { NodeId } from '../../flow/node-id'
import { Variant } from '../../variant'

const MAX_ITERATIONS = 10_000

type HeapItem = {
  path: Flow.Edge[]
  currentNode: NodeId
  visited: Set<NodeId>
  cost: number
  heuristic: number
}

export const toAllPossiblePipelines = function* (input: {
  model: Variant.Model
  groupId: GroupId
  startId: NodeId
  endId: NodeId
}): Iterable<Flow.Edge[]> {
  const minHeap = new MinHeap<HeapItem>((a, b) => a.heuristic - b.heuristic)
  const visitedPaths = new Set<string>()
  let iterations = 0

  minHeap.insert({
    path: [],
    currentNode: input.startId,
    visited: new Set([input.startId]),
    cost: 0,
    heuristic: Variant.distance(input.model, input.startId, input.endId),
  })

  while (true) {
    if (iterations >= MAX_ITERATIONS) break

    iterations++

    const min = minHeap.extractMin()

    if (!min) break

    const { path, currentNode, visited, cost } = min

    if (currentNode === input.endId) {
      const normalizedPath = normalizePath(path)
      if (!visitedPaths.has(normalizedPath)) {
        visitedPaths.add(normalizedPath)
        yield path
      }
      continue
    }

    for (const edgeOut of Flow.yieldEdgesOut(input.model, currentNode)) {
      const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId)

      if (targetGroupId && targetGroupId !== input.groupId) continue

      if (visited.has(edgeOut.targetId)) continue

      const newPath = [...path, edgeOut]
      const newVisited = new Set(visited).add(edgeOut.targetId)
      const newCost = cost + 1
      const heuristic = toHeuristic(input.model, edgeOut.targetId, input.endId, newPath)

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
  return distanceHeuristic + turnsHeuristic
}

const normalizePath = (path: Flow.Edge[]): string => {
  return path.map((edge) => `${edge.sourceId}-${edge.targetId}`).join(',')
}
