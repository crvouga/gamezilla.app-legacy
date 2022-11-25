import { eq, memoize, Random } from "../../Core"
import { Direction, Position } from "./Position"

//
//
// Model
//
//

export type Maze = {
  lower: Position
  upper: Position
  edges: [Position, Position][]
}

//
//
//
//
//

const make = ({
  seed,
  lower,
  upper,
}: {
  seed: string
  lower: Position
  upper: Position
}) => {
  const gen = Random.generator(seed)

  const maze: Maze = { edges: [], lower, upper }

  const stack = [lower]
  const visited = new Set<string>([Position.toKey(lower)])

  while (true) {
    const current = stack.pop()

    if (!current) {
      break
    }

    let unvisitedNeighbor: { position: Position; direction: Direction } | null =
      null

    for (const direction of Random.shuffle(gen, Direction.all)) {
      const neighbor = Position.add(Direction.toVector(direction), current)

      if (!hasVertex(neighbor, maze)) {
        continue
      }

      if (visited.has(Position.toKey(neighbor))) {
        continue
      }

      unvisitedNeighbor = { position: neighbor, direction }
      break
    }

    if (!unvisitedNeighbor) {
      continue
    }

    stack.push(current)
    stack.push(unvisitedNeighbor.position)
    visited.add(Position.toKey(unvisitedNeighbor.position))
    maze.edges.push([current, unvisitedNeighbor.position])
  }

  removeDeadEnds({ limit: Infinity, gen }, maze)

  return maze
}

const removeDeadEnds = ({ gen, limit }: { gen: () => number, limit: number }, maze: Maze) => {
  let count = 0

  for (let x = maze.lower.x; x <= maze.upper.x; x++) {
    for (let y = maze.lower.y; y <= maze.upper.y; y++) {
      const position: Position = { x, y }

      const adjacencies = toAdjacencies(position, maze)

      if (adjacencies.length >= 2) {
        continue
      }

      for (const direction of Random.shuffle(gen, Direction.all)) {
        const neighbor = Position.add(Direction.toVector(direction), position)

        if (!hasVertex(neighbor, maze)) {
          continue
        }

        const isAdjacent = adjacencies.some(adj => Position.eq(adj, neighbor))

        if (isAdjacent) {
          continue
        }

        maze.edges.push([neighbor, position])
        count++
        if (count >= limit) {
          return
        }

        break
      }
    }
  }
}

const makeMemoized = memoize(
  ({ seed, lower, upper }) =>
    [seed, lower.x, lower.y, upper.x, upper.y].join("-"),
  make,
)


const toAdjacencies = (position: Position, maze: Maze) => {
  const adjancent: Position[] = []

  for (const edge of maze.edges) {
    if (Position.eq(position, edge[0])) {
      adjancent.push(edge[1])
    }

    if (Position.eq(position, edge[1])) {
      adjancent.push(edge[0])
    }
  }

  return adjancent
}




const hasVertex = (vertex: Position, { lower, upper }: Maze): boolean => {
  return (
    lower.x <= vertex.x &&
    vertex.x <= upper.x &&
    lower.y <= vertex.y &&
    vertex.y <= upper.y
  )
}

const hasEdge = (edge: [Position, Position], maze: Maze): boolean => {
  return maze.edges.some((arbitrary) => eqEdge(arbitrary, edge))
}

const eqEdge = <T>(x: [T, T], y: [T, T]): boolean => {
  return (
    (eq(x[0], y[0]) && eq(x[1], y[1])) || (eq(x[1], y[0]) && eq(x[0], y[1]))
  )
}

export const Maze = {
  make,
  makeMemoized,
  hasEdge,
  hasVertex,
}
