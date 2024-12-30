import { Err, Ok, type Result } from '~/@/core'
import { Direction, Position } from './gomoku-position'
import { NonEmpty } from '~/@/array/non-empty'
import { Random } from '~/@/random/random'

export type Board = {
  [x: number]: {
    [y: number]: Stone
  }
}

export const initBoard: Board = {}

export type BotLevel = 'Easy' | 'Medium' | 'Hard'

export const botLevels: { [botLevel in BotLevel]: BotLevel } = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard'
}

export type Stone = 'white' | 'black'

export const stones: { [stone in Stone]: Stone } = {
  white: 'white',
  black: 'black'
}

export const toOppositeStone = (stone: Stone): Stone => {
  switch (stone) {
    case 'black': {
      return 'white'
    }

    case 'white': {
      return 'black'
    }
  }
}

export type Bounds = {
  lower: Position
  upper: Position
}

export type Preset = '9x9' | '13x13' | '19x19'

export const presetToBound = {
  '9x9': {
    lower: { x: 0, y: 0 },
    upper: { x: 8, y: 8 }
  },
  '13x13': {
    lower: { x: 0, y: 0 },
    upper: { x: 12, y: 12 }
  },
  '19x19': {
    lower: { x: 0, y: 0 },
    upper: { x: 18, y: 18 }
  }
}

export const presetToAllPositions = {
  '9x9': Position.rangeExclusive(presetToBound['9x9']),
  '13x13': Position.rangeExclusive(presetToBound['13x13']),
  '19x19': Position.rangeExclusive(presetToBound['19x19'])
}

export const presetToStars = {
  '9x9': [
    { x: 2, y: 2 },
    { x: 6, y: 2 },
    { x: 4, y: 4 },
    { x: 2, y: 6 },
    { x: 6, y: 6 }
  ],
  '13x13': [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 6, y: 6 },
    { x: 3, y: 9 },
    { x: 9, y: 9 }
  ],
  '19x19': [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 15, y: 3 },
    { x: 3, y: 9 },
    { x: 9, y: 9 },
    { x: 15, y: 9 },
    { x: 3, y: 15 },
    { x: 9, y: 15 },
    { x: 15, y: 15 }
  ]
}

export const bounds: Bounds = {
  lower: {
    x: 0,
    y: 0
  },
  upper: {
    x: 9,
    y: 9
  }
}

export const allPositions = Position.rangeExclusive(bounds)

export type MoveProblem = 'out-of-bounds' | 'not-turn' | 'position-occupied' | 'game-over'

const inBounds = (position: Position): boolean => {
  return (
    bounds.lower.x <= position.x &&
    position.x <= bounds.upper.x &&
    bounds.lower.y <= position.y &&
    position.y <= bounds.upper.y
  )
}

export const move = ({
  position,
  stone,
  board
}: {
  position: Position
  stone: Stone
  board: Board
}): Result<MoveProblem, Board> => {
  if (!inBounds(position)) {
    return Err('out-of-bounds')
  }

  const status = toStatus(board)

  if (status.type === 'win') {
    return Err('game-over')
  }

  if (status.type === 'draw') {
    return Err('game-over')
  }

  if (status.turn !== stone) {
    return Err('not-turn')
  }

  if (toStone(position, board)) {
    return Err('position-occupied')
  }

  const boardNew = setStone(position, stone, board)

  return Ok(boardNew)
}

export const toBestMove = ({ stone, board }: { stone: Stone; board: Board }) => {
  for (const position of Random.shuffle(String(Math.random()), allPositions)) {
    const moved = move({
      position,
      stone,
      board
    })
    if (moved.t === 'ok') {
      return position
    }
  }
  return null
}

export const setStone = (position: Position, stone: Stone, board: Board): Board => {
  return {
    ...board,
    [position.x]: {
      ...board[position.x],
      [position.y]: stone
    }
  }
}

export const toStone = (position: Position, board: Board): Stone | null => {
  return board[position.x]?.[position.y] ?? null
}

export const toTurn = (board: Board): Stone => {
  const freq = { black: 0, white: 0 }

  for (const xKey in board) {
    for (const yKey in board[xKey]) {
      const x = Number(xKey)
      const y = Number(yKey)
      const stone = toStone(
        {
          x,
          y
        },
        board
      )
      if (!stone) {
        continue
      }
      freq[stone] = freq[stone] + 1
    }
  }

  if (freq.white <= freq.black) {
    return 'white'
  }

  return 'black'
}

export const toStatus = (board: Board) => {
  const wins = toWins(board)

  if (NonEmpty.is(wins)) {
    return {
      type: 'win',
      wins,
      winner: wins[0].stone
    } as const
  }

  if (isDraw(board)) {
    return {
      type: 'draw'
    } as const
  }

  const turn = toTurn(board)

  return {
    type: 'game',
    turn
  } as const
}

const isDraw = (board: Board) => {
  return allPositions.every((position) => toStone(position, board) !== null)
}

const minWinLength = 5

export type Win = {
  stone: Stone
  positions: Position[]
}

const toKey = ({ position, direction }: { position: Position; direction: Direction }): string => {
  return [position.x, position.y, direction].join('-')
}

export const toWins = (board: Board): Win[] => {
  const wins: Win[] = []
  const visited = new Set<string>()

  for (const { x, y, stone } of yieldPositions(board)) {
    for (const direction of Direction.all) {
      let current: Position = {
        x,
        y
      }

      if (
        visited.has(
          toKey({
            position: current,
            direction
          })
        )
      ) {
        continue
      }

      const win: Position[] = [current]

      const vector = Direction.toVector(direction)

      while (true) {
        const next = Position.add(vector, current)
        const nextStone = toStone(next, board)
        if (!nextStone) {
          break
        }
        if (nextStone !== stone) {
          break
        }
        win.push(next)
        current = next
      }

      const oppositeVector = Position.rotate({
        theta: 180,
        center: {
          x: 0,
          y: 0
        },
        position: vector
      })

      while (true) {
        const next = Position.add(oppositeVector, current)
        const nextStone = toStone(next, board)
        if (!nextStone) {
          break
        }
        if (nextStone !== stone) {
          break
        }
        win.push(next)
        current = next
      }

      for (const position of win) {
        visited.add(
          toKey({
            position,
            direction
          })
        )
      }

      if (win.length >= minWinLength) {
        wins.push({
          stone,
          positions: win
        })
      }
    }
  }

  return wins
}

const yieldPositions = function* (board: Board): Generator<Position & { stone: Stone }> {
  for (const xKey in board) {
    for (const yKey in board[xKey]) {
      const x = Number(xKey)
      const y = Number(yKey)
      const stone = toStone(
        {
          x,
          y
        },
        board
      )

      if (!stone) {
        continue
      }

      yield {
        x,
        y,
        stone
      }
    }
  }
}
