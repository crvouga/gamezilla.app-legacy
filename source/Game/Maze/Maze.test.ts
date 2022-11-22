import { Maze } from "./Maze"
describe("Maze", () => {
    it("always generates the same maze", () => {
        const seed = "some arbitrary seed"
        const lower = { x: 0, y: 0 }
        const upper = { x: 10, y: 10 }


        const maze = Maze.make({ seed, upper, lower })

        for (let i = 0; i < 3; i++) {
            expect(maze).toEqual(Maze.make({ seed, upper, lower }))
        }
    })
})