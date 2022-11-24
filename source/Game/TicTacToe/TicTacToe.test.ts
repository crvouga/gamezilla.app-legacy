import { Board, move, PlayerType, toBestMove } from "./TicTacToe"

describe("TicTacToe", () => {
  it("Okfully moves", () => {
    const before: Board = [
      ["X", "O", "_"],
      ["X", "_", "_"],
      ["_", "_", "_"],
    ]

    const expected: Board = [
      ["X", "O", "_"],
      ["X", "_", "_"],
      ["O", "_", "_"],
    ]

    const result = move({
      board: before,
      player: "O",
      position: { row: 0, column: 2 },
    })

    expect(result.type).toBe("Ok")
    if (result.type === "Ok") {
      expect(expected).toEqual(result.value)
    }
  })

  it("makes winning move", () => {
    const before: Board = [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["_", "_", "_"],
    ]

    const expected: Board = [
      ["X", "O", "_"],
      ["X", "O", "_"],
      ["X", "_", "_"],
    ]

    const botPlayerType: PlayerType = "X"

    const bestMoveResult = toBestMove({
      depth: 1,
      maximizingPlayer: botPlayerType,
      board: before,
    })

    expect(bestMoveResult.type).toBe("Ok")

    if (bestMoveResult.type === "Err") {
      return
    }

    const result = move({
      board: before,
      player: botPlayerType,
      position: bestMoveResult.value,
    })

    expect(result.type).toBe("Ok")
    if (result.type === "Ok") {
      expect(expected).toEqual(result.value)
    }
  })

  it("blocks winning move", () => {
    const before: Board = [
      ["X", "O", "_"],
      ["X", "_", "_"],
      ["_", "_", "_"],
    ]

    const expected: Board = [
      ["X", "O", "_"],
      ["X", "_", "_"],
      ["O", "_", "_"],
    ]

    const botPlayerType: PlayerType = "O"

    const bestMoveResult = toBestMove({
      depth: 1,
      maximizingPlayer: botPlayerType,
      board: before,
    })

    expect(bestMoveResult.type).toBe("Ok")

    if (bestMoveResult.type === "Err") {
      return
    }

    const result = move({
      board: before,
      player: botPlayerType,
      position: bestMoveResult.value,
    })

    expect(result.type).toBe("Ok")
    if (result.type === "Ok") {
      expect(expected).toEqual(result.value)
    }
  })
})
