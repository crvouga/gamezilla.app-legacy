import { isSubset } from '~/@/array/is-subset'
import { unique } from '~/@/array/unique'
import { Err, Ok, type Result } from '~/@/result'
import { p } from '~/@/parser'
import { eq } from '~/@/equals/equals'

//
//
//
//
//
//
//
//

export type Pos2d = { x: number; y: number }

//
//
//
//  Model
//
//
//

export const ALL_PLAYER_TYPES = ['player-one', 'player-two'] as const

export const PlayerType = p.enumeration(ALL_PLAYER_TYPES)

export type PlayerType = p.Infer<typeof PlayerType>

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  'player-one': 'player-one',
  'player-two': 'player-two',
}

export const opposite: { [playerType in PlayerType]: PlayerType } = {
  'player-one': 'player-two',
  'player-two': 'player-one',
}

type Color = 'Red' | 'Yellow'

export const playerTypeToColor: { [key in PlayerType]: Color } = {
  'player-one': 'Red',
  'player-two': 'Yellow',
}

export const Column = p.arr(PlayerType)
export type Column = p.Infer<typeof Column>

export const Columns = p.arr(Column)
export type Columns = p.Infer<typeof Columns>

export const MAX_COLUMN_HEIGHT = 6

export const EMPTY_COLUMNS: Columns = [[], [], [], [], [], [], []]

export const COLUMN_COUNT = EMPTY_COLUMNS.length

export const ALL_COLUMN_INDEXES = [0, 1, 2, 3, 4, 5, 6] as const
export const ColumnIndex = p.enumeration(ALL_COLUMN_INDEXES)
export type ColumnIndex = p.Infer<typeof ColumnIndex>

export const ALL_POSITIONS: Pos2d[] = []
for (let x = 0; x < COLUMN_COUNT; x++) {
  for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
    ALL_POSITIONS.push({
      x: x,
      y: y,
    })
  }
}

export const isColumnIndex = (index: unknown): index is ColumnIndex => {
  return (
    typeof index === 'number' &&
    (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 6)
  )
}

export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5

export const ALL_MOVE_PROBLEMS = [
  'game-over-winner',
  'game-over-tie',
  'not-turn',
  'column-is-full',
  'out-of-bounds',
] as const
export const MoveProblem = p.enumeration(ALL_MOVE_PROBLEMS)
export type MoveProblem = p.Infer<typeof MoveProblem>

export const moveProblemToString = (problem: MoveProblem): string => {
  switch (problem) {
    case 'game-over-winner':
      return 'Game over, winner'
    case 'game-over-tie':
      return 'Game over, tie'
    case 'not-turn':
      return 'Not your turn'
    case 'column-is-full':
      return 'Column is full'
    case 'out-of-bounds':
      return 'Out of bounds'
  }
}

export type MoveResult = Result<MoveProblem, Columns>

export const dropDisc = (columns: Columns, columnIndex: number, player: PlayerType): MoveResult => {
  const status = toStatus(columns)

  if (status.type === 'Winner') {
    return Err('game-over-winner')
  }

  if (status.type === 'Tie') {
    return Err('game-over-tie')
  }

  const turn = status.turn

  if (turn !== player) {
    return Err('not-turn')
  }

  const column = columns[columnIndex]

  if (!column) {
    return Err('out-of-bounds')
  }

  if (column.length >= MAX_COLUMN_HEIGHT) {
    return Err('column-is-full')
  }

  const columnsNew = columns.map((column, index) => {
    if (index === columnIndex) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
    }
    return column
  })

  return Ok(columnsNew)
}

export const isGameOver = (columns: Columns): boolean => {
  return toStatus(columns).type !== 'Playing'
}

export const toSlot = (columns: Columns, { x, y }: { x: number; y: number }): PlayerType | 'Empty' => {
  const slot = columns?.[x]?.[y]

  if (slot) {
    return slot
  }

  return 'Empty'
}

export const toTurn = (columns: Columns): PlayerType => {
  return columns.flat().length % 2 === 0 ? 'player-one' : 'player-two'
}

const isFull = (columns: Columns) => {
  return columns.flat().length >= MAX_COLUMN_HEIGHT * COLUMN_COUNT
}

export type Status =
  | {
      type: 'Playing'
      turn: PlayerType
    }
  | {
      type: 'Winner'
      winner: PlayerType
    }
  | {
      type: 'Tie'
    }

export const toStatus = (columns: Columns): Status => {
  const wins = findWins(columns)
  const turn = toTurn(columns)
  const [win] = wins

  if (win) {
    const [position] = win

    if (!position) {
      return {
        type: 'Playing',
        turn,
      }
    }

    const winner = toSlot(columns, position)

    if (winner === 'Empty') {
      return {
        type: 'Playing',
        turn,
      }
    }

    return {
      type: 'Winner',
      winner,
    }
  }

  if (isFull(columns)) {
    return {
      type: 'Tie',
    }
  }

  return {
    type: 'Playing',
    turn,
  }
}

//
//
//
// Wins
//
//
//

const toKey = ({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }): string => {
  return `${x}, ${y}, ${dx}, ${dy}`
}

export const MIN_WIN_LENGTH = 4

const directions: [number, number][] = [
  // horizontal
  [1, 0],
  // vertical
  [0, 1],
  // right diagonal
  [1, 1],
  // left diagonal
  [1, -1],
]

export type Win = [Pos2d, Pos2d, Pos2d, Pos2d, ...Pos2d[]]

export const winToId = (win: Win) => win.map((x) => `${x.x},${x.y}`).join(' ')

export const findWins = (columns: Columns): Win[] => {
  const consecutives = findAllConsecutives(columns)
  const wins = consecutives.filter(isWin)
  const uniqueWins = unique(isSameWin, wins)
  return uniqueWins
}

const findAllConsecutives = (columns: Columns): Pos2d[][] => {
  const consecutives: Pos2d[][] = []

  const visited = new Set<string>()

  for (let x = 0; x < columns.length; x++) {
    const column = columns[x]

    if (!column) {
      continue
    }

    for (let y = 0; y < column.length; y++) {
      for (const [dx, dy] of directions) {
        if (
          visited.has(
            toKey({
              x,
              y,
              dx,
              dy,
            }),
          )
        ) {
          continue
        }

        const targetSlot = column[y]

        if (!targetSlot) {
          continue
        }

        const consecutive: Pos2d[] = []

        let position = {
          x,
          y,
        }

        while (true) {
          const currentSlot = toSlot(columns, position)

          if (currentSlot !== targetSlot) {
            break
          }

          visited.add(
            toKey({
              x: position.x,
              y: position.y,
              dx,
              dy,
            }),
          )

          consecutive.push(position)

          position = {
            x: position.x + dx,
            y: position.y + dy,
          }
        }
        consecutives.push(consecutive)
      }
    }
  }

  return consecutives
}

const isWin = (positions: Pos2d[]): positions is Win => {
  return positions.length >= MIN_WIN_LENGTH
}

const isSameWin = (a: Win, b: Win) => {
  return isSubset(eq, a, b) && isSubset(eq, b, a)
}
