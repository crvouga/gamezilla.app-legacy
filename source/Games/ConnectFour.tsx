import * as Route from "Route"
import * as View from "View"
import { Cmd } from "Core"

//
//
//
//
//  Board
//
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
// Model
//
//
//

export type Model = {
  columns: Columns
}

export const init: Model = {
  columns: emptyColumns,
}

/* 
Check win
*/

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
    const adjancentPosition = {
      x: x + dx,
      y: y + dy,
    }

    const adjancentSlot = toSlot(columns, adjancentPosition)

    const slot = toSlot(columns, { x, y })

    if (adjancentSlot === slot) {
      yield adjancentPosition
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
//
// View
//
//
//
//

export const Icon = () => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holemask: "holemask",
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg width="100%" viewBox={"0 0 2 2"}>
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
        </pattern>

        <mask id={ids.holemask}>
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

        <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={theme.primary.light} />
          <stop offset="100%" stopColor={theme.primary.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerOne.light} />
          <stop offset="100%" stopColor={theme.playerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerTwo.light} />
          <stop offset="100%" stopColor={theme.playerTwo.dark} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={2} height={2} fill={theme.primary.darker} />

      <circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

      <circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

      <circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

      <circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holemask})`}
      />
    </svg>
  )
}

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

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedBoard"; columnIndex: number }
  | { type: "UserClickedRestartButton" }

export type GroupedMsg = { group: "ConnectFour" } & Msg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back]

    case "UserClickedBoard":
      const columnsNew = move(
        model.columns,
        msg.columnIndex,
        toTurn(model.columns),
      )
      return [{ ...model, columns: columnsNew }, Cmd.None]

    case "UserClickedRestartButton":
      return [{ ...model, columns: emptyColumns }, Cmd.None]
  }
}

//
//
//
//
// View
//
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={`${toTurn(model.columns)}'s turn`}
        />
        <Board
          columns={model.columns}
          onClick={(columnIndex) =>
            dispatch({ type: "UserClickedBoard", columnIndex })
          }
        />
        <View.Button
          fullWidth
          size="large"
          onClick={() => dispatch({ type: "UserClickedRestartButton" })}
        >
          Restart
        </View.Button>
      </View.Page>
    )

const Board = ({
  columns,
  onClick,
}: {
  columns: Columns
  onClick: (columnIndex: number) => void
}) => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holemask: "holemask",
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg width="100%" viewBox={"0 0 7 6"}>
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
        </pattern>

        <mask id={ids.holemask}>
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

        <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={theme.primary.light} />
          <stop offset="100%" stopColor={theme.primary.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerOne.light} />
          <stop offset="100%" stopColor={theme.playerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={theme.playerTwo.light} />
          <stop offset="100%" stopColor={theme.playerTwo.dark} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={7} height={6} fill={theme.primary.darker} />

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
        mask={`url(#${ids.holemask})`}
      />

      {[...new Array(COLUMN_COUNT)].map((_, columnIndex) => (
        <rect
          style={{
            cursor:
              (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                ? "not-allowed"
                : "pointer",
          }}
          onClick={() => onClick(columnIndex)}
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
