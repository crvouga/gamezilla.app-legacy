import { eq, isSubset, shuffle, Task, unique } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"

//
//
//
//  Model
//
//
//

export type PlayerType = "PlayerOne" | "PlayerTwo"

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  PlayerOne: "PlayerOne",
  PlayerTwo: "PlayerTwo",
}

export const opposite: { [playerType in PlayerType]: PlayerType } = {
  PlayerOne: "PlayerTwo",
  PlayerTwo: "PlayerOne",
}

type Color = "Red" | "Yellow"

export const playerTypeToColor: { [key in PlayerType]: Color } = {
  PlayerOne: "Red",
  PlayerTwo: "Yellow",
}

export type Column = readonly PlayerType[]

export type Columns = [Column, Column, Column, Column, Column, Column, Column]

export const mapColumns = (
  columns: Columns,
  f: (column: Column, columnIndex: ColumnIndex) => Column,
): Columns => {
  return [
    f(columns[0], 0),
    f(columns[1], 1),
    f(columns[2], 2),
    f(columns[3], 3),
    f(columns[4], 4),
    f(columns[5], 5),
    f(columns[6], 6),
  ]
}

export const MAX_COLUMN_HEIGHT = 6

export const emptyColumns: Columns = [[], [], [], [], [], [], []]
export const COLUMN_COUNT = emptyColumns.length

export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const allColumnIndexes: ColumnIndex[] = [0, 1, 2, 3, 4, 5, 6]

export const isColumnIndex = (index: unknown): index is ColumnIndex => {
  return (
    typeof index === "number" && (
      index === 0 ||
      index === 1 ||
      index === 2 ||
      index === 3 ||
      index === 4 ||
      index === 5 ||
      index === 6
    )
  )
}

export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5

export type MoveProblem =
  | "game_over_winner"
  | "game_over_tie"
  | "not_turn"
  | "column_is_full"
  | "out_of_bounds"

export type MoveResult = Result<MoveProblem, Columns>

export const move = (
  columns: Columns,
  columnIndex: ColumnIndex,
  player: PlayerType,
): MoveResult => {
  const status = toStatus(columns)

  if (status.type === "Winner") {
    return Err("game_over_winner")
  }

  if (status.type === "Tie") {
    return Err("game_over_tie")
  }

  const turn = status.turn

  if (turn !== player) {
    return Err("not_turn")
  }

  const column = columns[columnIndex]

  if (!column) {
    return Err("out_of_bounds")
  }

  if (column.length === MAX_COLUMN_HEIGHT) {
    return Err("column_is_full")
  }

  const columnsNew = mapColumns(columns, (column, index) => {
    if (index === columnIndex) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
    }
    return column
  })

  return Ok(columnsNew)
}

export type BestMoveProblem = "no_move_available"

export type BestMoveResult = Result<BestMoveProblem, ColumnIndex>

export const toBestMove = ({
  columns,
  maximizingPlayer,
}: {
  columns: Columns
  maximizingPlayer: PlayerType
}): BestMoveResult => {
  for (const columnIndex of shuffle(allColumnIndexes)) {
    const result = move(columns, columnIndex, maximizingPlayer)
    if (result.type === "Ok") {
      return Ok(columnIndex)
    }
  }
  return Err("no_move_available")
}

export const getBestMove =
  ({
    columns,
    maximizingPlayer,
  }: {
    columns: Columns
    maximizingPlayer: PlayerType
  }): Task<BestMoveResult> =>
    async () => {
      const result = toBestMove({ columns, maximizingPlayer })

      await new Promise((resolve) => setTimeout(resolve, 1_000))

      return result
    }

export const toSlot = (
  columns: Columns,
  { x, y }: { x: number; y: number },
): PlayerType | "Empty" => {
  const slot = columns?.[x]?.[y]

  if (slot) {
    return slot
  }

  return "Empty"
}

export const toTurn = (columns: Columns): PlayerType => {
  return columns.flat().length % 2 === 0 ? "PlayerOne" : "PlayerTwo"
}

const isFull = (columns: Columns) => {
  return columns.flat().length >= MAX_COLUMN_HEIGHT * COLUMN_COUNT
}

export type Status =
  | {
    type: "Playing"
    turn: PlayerType
  }
  | {
    type: "Winner"
    winner: PlayerType
  }
  | {
    type: "Tie"
  }

export const toStatus = (columns: Columns): Status => {
  const wins = toWins(columns)
  const turn = toTurn(columns)
  const [win] = wins

  if (win) {
    const [position] = win

    if (!position) {
      return {
        type: "Playing",
        turn,
      }
    }

    const winner = toSlot(columns, position)

    if (winner === "Empty") {
      return {
        type: "Playing",
        turn,
      }
    }

    return {
      type: "Winner",
      winner,
    }
  }

  if (isFull(columns)) {
    return {
      type: "Tie",
    }
  }

  return {
    type: "Playing",
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

type Position = { x: number; y: number }

const toKey = ({
  x,
  y,
  dx,
  dy,
}: {
  x: number
  y: number
  dx: number
  dy: number
}): string => {
  return `${x}, ${y}, ${dx}, ${dy}`
}

export const minWinLength = 4

const directions: [number, number][] = [
  // horizontal
  [1, 0],
  [-1, 0],
  // vertical
  [0, 1],
  [0, -1],
  // right diagonal
  [1, 1],
  [-1, -1],
  // left diagonal
  [1, -1],
  [-1, 1],
]

type Win = Position[]

export const toWins = (columns: Columns): Position[][] => {
  const wins: Win[] = []

  const visited = new Set<string>()

  for (let x = 0; x < columns.length; x++) {
    for (let y = 0; y < columns[x]!.length; y++) {
      for (const [dx, dy] of directions) {
        if (visited.has(toKey({ x, y, dx, dy }))) {
          continue
        }

        const targetSlot = toSlot(columns, { x, y })

        if (targetSlot === "Empty") {
          continue
        }

        const win: Position[] = []

        let position: Position = { x: x, y: y }

        while (true) {
          visited.add(toKey({ x: position.x, y: position.y, dx, dy }))

          win.push(position)

          position = { x: position.x + dx, y: position.y + dy }

          if (toSlot(columns, position) !== targetSlot) {
            break
          }
        }

        if (win.length >= minWinLength) {
          wins.push(win)
        }
      }
    }
  }

  return unique(isSameWin, wins)
}

const isSameWin = (a: Win, b: Win) => isSubset(eq, a, b) && isSubset(eq, b, a)
