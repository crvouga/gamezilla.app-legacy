import { toMaze } from "./Maze.Types"

describe("Maze", () => {
    it("always generates the same maze", () => {
        const seed = "some arbitrary seed"
        const inclusiveUpperBound = { x: 10, y: 10 }


        const maze = toMaze({ seed, inclusiveUpperBound })

        for (let i = 0; i < 3; i++) {
            expect(maze).toEqual(toMaze({ seed, inclusiveUpperBound }))
        }
    })
})