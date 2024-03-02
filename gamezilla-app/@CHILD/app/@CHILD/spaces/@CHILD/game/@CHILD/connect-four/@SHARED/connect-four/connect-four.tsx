import {
  err,
  ok,
  Result,
  eq,
  isSubset,
  unique,
} from "gamezilla-app/@SHARED/core"

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

export type PlayerType = "player-one" | "player-two"

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  "player-one": "player-one",
  "player-two": "player-two",
}

export const opposite: { [playerType in PlayerType]: PlayerType } = {
  "player-one": "player-two",
  "player-two": "player-one",
}

type Color = "Red" | "Yellow"

export const playerTypeToColor: { [key in PlayerType]: Color } = {
  "player-one": "Red",
  "player-two": "Yellow",
}

export type Column = readonly PlayerType[]

export type Columns = Column[]

export const MAX_COLUMN_HEIGHT = 6

export const EMPTY_COLUMNS: Columns = [[], [], [], [], [], [], []]

export const COLUMN_COUNT = EMPTY_COLUMNS.length

export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const ALL_COLUMN_INDEXES: ColumnIndex[] = [0, 1, 2, 3, 4, 5, 6]

export const ALL_POSITIONS: Pos2d[] = []
for (let x = 0; x < COLUMN_COUNT; x++) {
  for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
    ALL_POSITIONS.push({ x: x, y: y })
  }
}

export const isColumnIndex = (index: unknown): index is ColumnIndex => {
  return (
    typeof index === "number" &&
    (index === 0 ||
      index === 1 ||
      index === 2 ||
      index === 3 ||
      index === 4 ||
      index === 5 ||
      index === 6)
  )
}

export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5

export type MoveProblem =
  | "game-over-winner"
  | "game-over-tie"
  | "not-turn"
  | "column-is-full"
  | "out-of-bounds"

export const moveProblemToString = (problem: MoveProblem): string => {
  switch (problem) {
    case "game-over-winner":
      return "Game over, winner"
    case "game-over-tie":
      return "Game over, tie"
    case "not-turn":
      return "Not your turn"
    case "column-is-full":
      return "Column is full"
    case "out-of-bounds":
      return "Out of bounds"
  }
}

export type MoveResult = Result<MoveProblem, Columns>

export const dropDisc = (
  columns: Columns,
  columnIndex: number,
  player: PlayerType,
): MoveResult => {
  const status = toStatus(columns)

  if (status.type === "Winner") {
    return err("game-over-winner")
  }

  if (status.type === "Tie") {
    return err("game-over-tie")
  }

  const turn = status.turn

  if (turn !== player) {
    return err("not-turn")
  }

  const column = columns[columnIndex]

  if (!column) {
    return err("out-of-bounds")
  }

  if (column.length >= MAX_COLUMN_HEIGHT) {
    return err("column-is-full")
  }

  const columnsNew = columns.map((column, index) => {
    if (index === columnIndex) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
    }
    return column
  })

  return ok(columnsNew)
}

export function isGameOver(columns: Columns): boolean {
  return toStatus(columns).type !== "Playing"
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
  return columns.flat().length % 2 === 0 ? "player-one" : "player-two"
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
  const wins = findWins(columns)
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

export const winToId = (win: Win) => win.map((x) => `${x.x},${x.y}`).join(" ")

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
        if (visited.has(toKey({ x, y, dx, dy }))) {
          continue
        }

        const targetSlot = column[y]

        if (!targetSlot) {
          continue
        }

        const consecutive: Pos2d[] = []

        let position = { x, y }

        while (true) {
          const currentSlot = toSlot(columns, position)

          if (currentSlot !== targetSlot) {
            break
          }

          visited.add(toKey({ x: position.x, y: position.y, dx, dy }))

          consecutive.push(position)

          position = { x: position.x + dx, y: position.y + dy }
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
