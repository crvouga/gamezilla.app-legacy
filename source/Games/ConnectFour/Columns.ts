//
//
//
//  Model
//
//
//

export type IPlayer = "PlayerOne" | "PlayerTwo"

export type IColumn = readonly IPlayer[]

export type Columns = readonly IColumn[]

export const MAX_COLUMN_HEIGHT = 6

export const COLUMN_COUNT = 7

export const emptyColumns: Columns = [...Array(COLUMN_COUNT)].map(() => [])

export const move = (
  columns: Columns,
  columnIndex: number,
  player: IPlayer,
): Columns => {
  return columns.map((column, index) => {
    if (index === columnIndex && toTurn(columns) === player) {
      return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
    }

    return column
  })
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

    const adjancentSlot = toSlot(columns, adjacentPosition)

    const slot = toSlot(columns, { x, y })

    if (adjancentSlot === slot) {
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
