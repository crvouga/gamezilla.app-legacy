//
//
//
//  Model
//
//
//

import { Result } from "../../Core"

export type IPlayer = "PlayerOne" | "PlayerTwo"

export type IColumn = readonly IPlayer[]

export type Columns = readonly IColumn[]

export const MAX_COLUMN_HEIGHT = 6

export const COLUMN_COUNT = 7

export const emptyColumns: Columns = [...Array(COLUMN_COUNT)].map(() => [])

export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

const isColumnIndex = (index: unknown): index is ColumnIndex => {
  return (
    typeof index === "number" &&
    (index === 0 ||
      index === 1 ||
      index === 2 ||
      index === 3 ||
      index === 4 ||
      index === 5 ||
      index == 6)
  )
}

export type RowIndex = 0 | 1 | 2 | 3 | 4 | 5

export type MoveProblem =
  | "not_players_turn"
  | "column_is_full"
  | "invalid_column_index"

export type MoveResult = Result.Result<MoveProblem, Columns>

export const move = (
  columns: Columns,
  columnIndex: ColumnIndex,
  player: IPlayer,
): MoveResult => {
  if (toTurn(columns) !== player) {
    return Result.Err("not_players_turn")
  }

  const column = columns[columnIndex]

  if (!column) {
    return Result.Err("invalid_column_index")
  }

  if (column.length === MAX_COLUMN_HEIGHT) {
    return Result.Err("column_is_full")
  }

  const columnsNew: Columns = columns.map((column, index) => {
    if (index === columnIndex && toTurn(columns) === player) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
    }

    return column
  })

  return Result.Ok(columnsNew)
}

export const toSlot = (
  columns: Columns,
  { x, y }: { x: number; y: number },
): IPlayer | "Empty" => {
  const slot = columns?.[x]?.[y]

  if (slot) {
    return slot
  }

  return "Empty"
}

const isEven = (x: number) => x % 2 === 0

export const toTurn = (columns: Columns): IPlayer => {
  return isEven(columns.flat().length) ? "PlayerTwo" : "PlayerOne"
}

const isFull = (columns: Columns) => {
  return columns.flat().length >= MAX_COLUMN_HEIGHT * COLUMN_COUNT
}

type IStatus =
  | {
      type: "Playing"
    }
  | {
      type: "Winner"
      winner: IPlayer
    }
  | {
      type: "Tie"
    }

export const toStatus = (columns: Columns): IStatus => {
  const winningLines = Array.from(
    filter((line) => line.length >= 5, yieldLines(columns)),
  )

  const [winningLine] = winningLines

  if (winningLine) {
    const [position] = winningLine

    if (!position) {
      return {
        type: "Playing",
      }
    }

    const winner = toSlot(columns, position)

    if (winner === "Empty") {
      return {
        type: "Playing",
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
  }
}

//
//
//
// Wins
//
//
//

function* yieldPositionsAndDirections(columns: Columns) {
  for (let x = 0; x <= columns.length; x++) {
    const column = columns[x]
    const columnLength = column?.length ?? 0
    for (let y = 0; y <= columnLength; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= dy; dx++) {
          yield {
            x,
            y,
            dx,
            dy,
          }
        }
      }
    }
  }
}

function* yieldLine({
  columns,
  x,
  y,
  dx,
  dy,
}: {
  columns: Columns
  x: number
  y: number
  dx: number
  dy: number
}) {
  yield {
    x,
    y,
  }

  while (true) {
    const adjacentPosition = {
      x: x + dx,
      y: y + dy,
    }

    const adjacentSlot = toSlot(columns, adjacentPosition)

    const slot = toSlot(columns, { x, y })

    if (adjacentSlot === slot) {
      yield adjacentPosition
    } else {
      break
    }
  }
}

function* yieldLines(columns: Columns) {
  const visited = new Set()

  for (const { x, y, dx, dy } of yieldPositionsAndDirections(columns)) {
    const key = `${x}${y}${dx}${dy}`

    if (visited.has(key)) {
      continue
    }

    visited.add(key)

    const line = Array.from(yieldLine({ columns, x, y, dx, dy }))

    yield line
  }
}

function* filter<T>(predicate: (item: T) => boolean, generator: Generator<T>) {
  for (const item of generator) {
    if (predicate(item)) {
      yield item
    }
  }
}

//
//
//
// View
//
//
//

export const theme = {
  primary: {
    light: "#1976D2",
    dark: "#2195F2",
    darker: "#0D47A1",
  },
  playerOne: {
    light: "#FFB74D",
    dark: "#FFA623",
  },
  playerTwo: {
    light: "#F24237",
    dark: "#DB332F",
  },
}

export const ViewColumns = ({
  columns,
  onClick,
}: {
  columns: Columns
  onClick: (columnIndex: ColumnIndex) => void
}) => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holeMask: "holeMask",
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg
      width="100%"
      viewBox={"0 0 7 6"}
    >
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle
            cx={0.5}
            cy={0.5}
            r={0.425}
            fill="black"
          ></circle>
        </pattern>

        <mask id={ids.holeMask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient
          id={ids.columnGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.primary.light}
          />
          <stop
            offset="100%"
            stopColor={theme.primary.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerOne.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerOne.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerTwo.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerTwo.dark}
          />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={7}
        height={6}
        fill={theme.primary.darker}
      />

      {columns.map((column, columnIndex) =>
        column.map((player, rowIndex) => (
          <circle
            key={[columnIndex, rowIndex].join(", ")}
            cx={columnIndex + 0.5}
            cy={MAX_COLUMN_HEIGHT - (rowIndex + 0.5)}
            r={0.5}
            fill={player === "PlayerOne" ? playerOneFill : playerTwoFill}
          />
        )),
      )}

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />

      {[...new Array(COLUMN_COUNT)].map((_, columnIndex) => (
        <rect
          style={{
            cursor:
              (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                ? "not-allowed"
                : "pointer",
          }}
          onClick={() => {
            if (isColumnIndex(columnIndex)) {
              onClick(columnIndex)
            }
          }}
          key={columnIndex}
          x={columnIndex}
          y={0}
          width={1}
          height={MAX_COLUMN_HEIGHT}
          fill="transparent"
        />
      ))}
    </svg>
  )
}

//
//
//
// Animation
//
//
//

// source: https://easings.net/#easeOutBounce
const easeOutBounce = (x: number): number => {
  const n1 = 7.5625
  const d1 = 2.75

  if (x < 1 / d1) {
    return n1 * x * x
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375
  }
}
