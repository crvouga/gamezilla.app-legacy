import { Maze } from "./Maze"
describe("Maze", () => {
    it("always generates the same maze", () => {
        const seed = "some arbitrary seed"
        const inclusiveUpperBound = { x: 10, y: 10 }


        const maze = Maze.make({ seed, inclusiveUpperBound })

        for (let i = 0; i < 3; i++) {
            expect(maze).toEqual(Maze.make({ seed, inclusiveUpperBound }))
        }
    })
})