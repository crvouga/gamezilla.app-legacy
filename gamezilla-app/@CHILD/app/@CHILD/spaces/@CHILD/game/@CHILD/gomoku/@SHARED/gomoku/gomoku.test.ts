import { describe, expect, it } from "test"
import { Board, setStone, Stone, toWins } from "./gomoku"

type Matrix = (" " | "b" | "w")[][]
const _ = " "
const w = "w"
const b = "b"

const toBoard = (matrix: Matrix): Board => {
  let board: Board = {}
  for (let x = 0; x < matrix.length; x++) {
    const slice = matrix[x]
    if (!slice) {
      continue
    }
    for (let y = 0; y < slice.length; y++) {
      const element = matrix?.[x]?.[y]
      const stone: Stone | null =
        element === "w" ? "white" : element === "b" ? "black" : null
      if (stone) {
        board = setStone({ x, y }, stone, board)
      }
    }
  }
  return board
}

describe(import.meta.file, () => {
  it("should detect one horizontal win", () => {
    const matrix: Matrix = [
      [w, w, w, w, w],
      [b, b, b, b, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ]
    const board = toBoard(matrix)
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it("should detect one vertical win", () => {
    const matrix: Matrix = [
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, _, _, _, _],
    ]
    const board = toBoard(matrix)
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it("should detect one left diagonal win", () => {
    const matrix: Matrix = [
      [w, _, _, _, _],
      [b, w, _, _, _],
      [_, b, w, _, _],
      [_, _, b, w, _],
      [_, _, _, b, w],
    ]
    const board = toBoard(matrix)
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it("should detect one right diagonal win", () => {
    const matrix: Matrix = [
      [_, _, _, _, w],
      [_, _, _, w, b],
      [_, _, w, b, _],
      [_, w, b, _, _],
      [w, b, _, _, _],
    ]
    const board = toBoard(matrix)
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })
})
