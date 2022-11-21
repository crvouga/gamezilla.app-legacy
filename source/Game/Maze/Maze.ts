import { memoize, Random } from "../../Core"
import { Bounds, Direction, Position } from "./Position"

// 
// 
// Model
// 
// 

export type Maze = Cell[][]

export type Cell = {
    hasNorth: boolean
    hasWest: boolean
}

// 
// 
// 
// 
// 

export type Params = {
    seed: string,
    inclusiveUpperBound: Position
}

const encodeParams = ({ seed, inclusiveUpperBound }: Params) => [seed, inclusiveUpperBound.x, inclusiveUpperBound.y].join("-")

const make = memoize<Params, Maze>(encodeParams, ({ seed, inclusiveUpperBound }) => {
    const gen = Random.generator(seed)

    const maze: Cell[][] = []

    for (let x = 0; x <= inclusiveUpperBound.x; x++) {
        const vertical: Cell[] = []
        for (let y = 0; y <= inclusiveUpperBound.y; y++) {
            vertical.push({ hasWest: true, hasNorth: true })
        }
        maze.push(vertical)
    }

    const boundsInclusive: Bounds = {
        lower: { x: 0, y: 0 },
        upper: inclusiveUpperBound
    }

    const initial: Position = { x: 0, y: 0 }
    const stack: Position[] = [initial]
    const visited = new Set<string>()
    visited.add(Position.toKey(initial))

    while (true) {
        const current = stack.pop()

        if (!current) {
            break
        }

        // 
        //
        // 

        let unvisitedNeighbor: { position: Position, direction: Direction } | null = null

        for (const direction of Random.shuffle(gen, Direction.all)) {
            const neighbor = Position.add(Direction.toVector(direction), current)

            if (!Position.inclusiveContains(boundsInclusive, neighbor)) {
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

        // 
        // break down walls
        // 
        switch (unvisitedNeighbor.direction) {
            case 'East':
                maze[unvisitedNeighbor.position.x]![unvisitedNeighbor.position.y]!.hasWest = false
                break

            case 'North':
                maze[current.x]![current.y]!.hasNorth = false
                break

            case 'South':
                maze[unvisitedNeighbor.position.x]![unvisitedNeighbor.position.y]!.hasNorth = false
                break

            case 'West':
                maze[current.x]![current.y]!.hasWest = false
                break
        }
    }

    return maze
})

export const Maze = {
    make,
}
