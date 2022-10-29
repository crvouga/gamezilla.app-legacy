import { Board, move, PlayerType, toBestMove } from "./TicTacToe"

describe("TicTacToe", () => {
    it("blocks winning move", async () => {
        const board: Board = [
            ['X', 'O', '_'],
            ['X', '_', '_'],
            ['_', '_', '_'],
        ]

        const botPlayerType: PlayerType = "O"

        const position = toBestMove({
            botLevel: "Medium",
            maximizingPlayer: botPlayerType,
            board
        })

        const moveResult = move({
            board,
            player: botPlayerType,
            position
        })

        expect(moveResult.type).toBe("Ok")

        if (moveResult.type === 'Err') {
            return
        }

        const expected: Board = [
            ['X', 'O', '_'],
            ['X', '_', '_'],
            ['O', '_', '_'],
        ]

        const actual = moveResult.value

        expect(expected).toEqual(actual)

    })
})