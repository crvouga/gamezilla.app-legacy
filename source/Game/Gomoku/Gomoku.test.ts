import { Stone, set_stone, Board, to_wins } from "./Gomoku"


type Matrix = (" " | "b" | "w")[][]
const _ = " "
const w = "w"
const b = "b"

const to_board = (matrix: Matrix): Board => {
    let board: Board = {}
    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix[x]!.length; y++) {
            const element = matrix[x]![y]
            const stone: Stone | null = element === 'w' ? 'white' : element === 'b' ? 'black' : null
            if (stone) {
                board = set_stone({ x, y }, stone, board)
            }
        }
    }
    return board
}

describe("Gomoku", () => {
    it("detects one horizontal win", () => {
        const matrix: Matrix = [
            [w, w, w, w, w],
            [b, b, b, b, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ]
        const board = to_board(matrix)
        const wins = to_wins(board)
        expect(wins.length).toBe(1)
    })

    it("detects one vertical win", () => {
        const matrix: Matrix = [
            [w, b, _, _, _],
            [w, b, _, _, _],
            [w, b, _, _, _],
            [w, b, _, _, _],
            [w, _, _, _, _],
        ]
        const board = to_board(matrix)
        const wins = to_wins(board)
        expect(wins.length).toBe(1)
    })

    it("detects one left diagonal win", () => {
        const matrix: Matrix = [
            [w, _, _, _, _],
            [b, w, _, _, _],
            [_, b, w, _, _],
            [_, _, b, w, _],
            [_, _, _, b, w],
        ]
        const board = to_board(matrix)
        const wins = to_wins(board)
        expect(wins.length).toBe(1)
    })
    it("detects one right diagonal win", () => {
        const matrix: Matrix = [
            [_, _, _, _, w],
            [_, _, _, w, b],
            [_, _, w, b, _],
            [_, w, b, _, _],
            [w, b, _, _, _],
        ]
        const board = to_board(matrix)
        const wins = to_wins(board)
        console.log(wins)
        expect(wins.length).toBe(1)
    })
})

