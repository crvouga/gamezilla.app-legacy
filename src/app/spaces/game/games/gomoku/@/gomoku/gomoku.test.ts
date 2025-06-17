import { describe, expect, it } from 'bun:test'
import { type Board, setStone, type Stone, toWins } from './gomoku'

type Matrix = (' ' | 'b' | 'w')[][]
const _ = ' '
const w = 'w'
const b = 'b'

const toBoard = (matrix: Matrix): Board => {
  let board: Board = {}
  for (let x = 0; x < matrix.length; x++) {
    const slice = matrix[x]
    if (!slice) {
      continue
    }
    for (let y = 0; y < slice.length; y++) {
      const element = matrix?.[x]?.[y]
      const stone: Stone | null = element === 'w' ? 'white' : element === 'b' ? 'black' : null
      if (stone) {
        board = setStone(
          {
            x,
            y,
          },
          stone,
          board,
        )
      }
    }
  }
  return board
}

describe('Test', () => {
  it('should detect one horizontal win', async () => {
    const board = toBoard([
      [w, w, w, w, w],
      [b, b, b, b, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it('should detect one vertical win', async () => {
    const board = toBoard([
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, b, _, _, _],
      [w, _, _, _, _],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it('should detect one left diagonal win', async () => {
    const board = toBoard([
      [w, _, _, _, _],
      [b, w, _, _, _],
      [_, b, w, _, _],
      [_, _, b, w, _],
      [_, _, _, b, w],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it('should detect one right diagonal win', async () => {
    const board = toBoard([
      [_, _, _, _, w],
      [_, _, _, w, b],
      [_, _, w, b, _],
      [_, w, b, _, _],
      [w, b, _, _, _],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(1)
  })

  it('should detect two wins', async () => {
    const board = toBoard([
      [w, w, w, w, w],
      [b, b, b, b, b],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(2)
  })

  it('should detect no wins', async () => {
    const board = toBoard([
      [w, w, w, w, b],
      [b, b, b, b, w],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ])
    const wins = toWins(board)
    expect(wins.length).toBe(0)
  })
})
