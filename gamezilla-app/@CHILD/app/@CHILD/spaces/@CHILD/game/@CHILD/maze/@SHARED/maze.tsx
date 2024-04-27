/* eslint-disable no-constant-condition */
import { eq, memoize, Random } from "gamezilla-app/@SHARED/core"
import { Direction, Position } from "./position"

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
  const maze: Maze = { edges: [], lower, upper }

  const stack = [lower]
  const visited = new Set<string>([Position.toKey(lower)])

  let count = 0

  while (true) {
    count++
    const current = stack.pop()

    if (!current) {
      break
    }

    let unvisitedNeighbor: {
      position: Position
      direction: Direction
    } | null = null

    for (const direction of Random.shuffle(`${seed}-${count}`, Direction.all)) {
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

  remove_dead_ends({ limit: Infinity, seed }, maze)

  return maze
}

const remove_dead_ends = (
  { seed, limit }: { seed: string; limit: number },
  maze: Maze,
) => {
  let count = 0

  for (let x = maze.lower.x; x <= maze.upper.x; x++) {
    for (let y = maze.lower.y; y <= maze.upper.y; y++) {
      const position: Position = { x, y }

      const connections = toConnections(position, maze)

      if (connections.length >= 2) {
        continue
      }

      for (const direction of Random.shuffle(seed, Direction.all)) {
        const neighbor = Position.add(Direction.toVector(direction), position)

        if (!hasVertex(neighbor, maze)) {
          continue
        }

        const isAdjacent = connections.some((adj) => Position.eq(adj, neighbor))

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

const makeMemoized = memoize({
  toKey: ({ seed, lower, upper }) =>
    [seed, lower.x, lower.y, upper.x, upper.y].join("-"),
  func: make,
  cacheCapacity: 100,
})

const toConnections = (position: Position, maze: Maze) => {
  const adjacent: Position[] = []

  for (const edge of maze.edges) {
    if (Position.eq(position, edge[0])) {
      adjacent.push(edge[1])
    }

    if (Position.eq(position, edge[1])) {
      adjacent.push(edge[0])
    }
  }

  return adjacent
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

const eqEdge = <T,>(x: [T, T], y: [T, T]): boolean => {
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

//
//
//
//
//

const coverArtMaze = Maze.make({
  seed: "cover art maze!",
  lower: { x: 0, y: 0 },
  upper: { x: 8, y: 8 },
})

const viewBox = [
  coverArtMaze.lower.x,
  coverArtMaze.lower.y,
  coverArtMaze.upper.x - coverArtMaze.lower.x + 1,
  coverArtMaze.upper.y - coverArtMaze.lower.y + 1,
].join(" ")

export const CoverArt = () => {
  return (
    <svg viewBox={viewBox} width="100%" className="border border-neutral-800">
      <rect
        x={coverArtMaze.lower.x}
        y={coverArtMaze.lower.y}
        width="100%"
        height="100%"
        fill={"#000"}
      />
      {coverArtMaze.edges.map(([a, b]) => (
        <g
          key={[a.x, a.y, b.x, b.y].join("-")}
          strokeWidth="0.1"
          stroke={"#fff"}
        >
          <line
            x1={a.x + 1 / 2}
            y1={a.y + 1 / 2}
            x2={b.x + 1 / 2}
            y2={b.y + 1 / 2}
          />
        </g>
      ))}
    </svg>
  )
}
