import { useEffect, useLayoutEffect, useRef } from "react"
import { Result, Err, Ok } from "../../Core/Result"

//
//
//
//  Model
//
//
//

export type PlayerType = "PlayerOne" | "PlayerTwo"

export const opposite: { [playerType in PlayerType]: PlayerType } = {
  PlayerOne: "PlayerTwo",
  PlayerTwo: "PlayerOne"
}

type Color = "Red" | "Yellow"

export const playerTypeToColor: { [key in PlayerType]: Color } = {
  PlayerOne: "Red",
  PlayerTwo: "Yellow"
}

export type Column = readonly PlayerType[]

export type Columns = [Column, Column, Column, Column, Column, Column, Column]

export const mapColumns = (columns: Columns, f: (column: Column, columnIndex: ColumnIndex) => Column): Columns => {
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
  | "game_over"
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

  if (status.type === 'Winner') {
    return Err("game_over")
  }

  if (status.type === 'Tie') {
    return Err("game_over")
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

  const columnsNew =
    mapColumns(columns, (column, index) => {
      if (index === columnIndex) {
        return column.concat([player]).slice(0, MAX_COLUMN_HEIGHT)
      }
      return column
    })

  return Ok(columnsNew)
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
        turn
      }
    }

    const winner = toSlot(columns, position)

    if (winner === "Empty") {
      return {
        type: "Playing",
        turn
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
    turn
  }
}

//
//
//
// Wins
//
//
//


type Position = { x: number, y: number }


const toKey = ({ x, y, dx, dy }: { x: number, y: number, dx: number, dy: number }): string => {
  return `${x}, ${y}, ${dx}, ${dy}`
}

export const minWinLength = 4

const directions: [number, number][] = [
  // horizontal
  [1, 0],
  // vertical
  [0, 1],
  // right diagonal
  [1, 1],
  // left diagonal
  [1, -1]
]

export const toWins = (columns: Columns): Position[][] => {
  const wins: Position[][] = []

  const visited = new Set<string>()

  for (let x = 0; x < columns.length; x++) {
    for (let y = 0; y < columns[x]!.length; y++) {
      for (const [dx, dy] of directions) {
        if (visited.has(toKey({ x, y, dx, dy }))) {
          break
        }

        const targetSlot = toSlot(columns, { x, y })

        if (targetSlot === 'Empty') {
          break
        }

        const win: Position[] = []

        let position: Position = { x: x, y: y }


        while (true) {
          win.push(position)

          visited.add(toKey({ x: position.x, y: position.y, dx, dy }))

          const nextPosition: Position = {
            x: position.x + dx,
            y: position.y + dy,
          }

          const nextSlot = toSlot(columns, nextPosition)

          if (nextSlot === "Empty") {
            break
          }

          if (nextSlot !== targetSlot) {
            break
          }

          position = nextPosition
        }

        if (win.length >= minWinLength) {
          wins.push(win)
        }
      }
    }
  }

  return wins
}

//
//
//
// View
//
//
//

export const gameTheme = {
  primary: {
    light: "#1976D2",
    dark: "#2195F2",
    darker: "#0D47A1",
  },
  PlayerOne: {
    light: "#F24237",
    dark: "#DB332F",
  },
  PlayerTwo: {
    light: "#FFB74D",
    dark: "#FFA623",
  },
}

export const ViewSvgDefs = () => {
  return (
    <></>
  )
}

export const ViewPlayerOneGradientDef = ({ gradientId }: { gradientId: string }) => {
  return (
    <linearGradient
      id={gradientId}
      gradientTransform="rotate(90)"
    >
      <stop
        offset="0%"
        stopColor={gameTheme.PlayerOne.light}
      />
      <stop
        offset="100%"
        stopColor={gameTheme.PlayerOne.dark}
      />
    </linearGradient>
  )
}

export const ViewPlayerTwoGradientDef = ({ gradientId }: { gradientId: string }) => {
  return (
    <linearGradient
      id={gradientId}
      gradientTransform="rotate(90)"
    >
      <stop
        offset="0%"
        stopColor={gameTheme.PlayerTwo.light}
      />
      <stop
        offset="100%"
        stopColor={gameTheme.PlayerTwo.dark}
      />
    </linearGradient>
  )
}


type ViewColumnsProps = {
  columns: Columns;
  ghost?: { columnIndex: ColumnIndex, playerType: PlayerType };
  onClick?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean
}

export const ViewColumns = ({
  implementation = "svg",
  ...props
}: ViewColumnsProps & {
  implementation?: "svg" | "canvas"
}) => {
  switch (implementation) {
    case 'canvas': {
      return <ViewColumnsCanvas {...props} />
    }

    case 'svg': {
      return <ViewColumnsSvg {...props} />
    }
  }
}

const ViewColumnsSvg = ({
  columns,
  onClick,
  onHover,
  ghost,
  disabled
}: ViewColumnsProps) => {
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
            stopColor={gameTheme.primary.light}
          />
          <stop
            offset="100%"
            stopColor={gameTheme.primary.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={gameTheme.PlayerOne.light}
          />
          <stop
            offset="100%"
            stopColor={gameTheme.PlayerOne.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={gameTheme.PlayerTwo.light}
          />
          <stop
            offset="100%"
            stopColor={gameTheme.PlayerTwo.dark}
          />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={7}
        height={6}
        fill={gameTheme.primary.darker}
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


      {!disabled && ghost && (
        <circle
          cx={ghost.columnIndex + 0.5}
          cy={MAX_COLUMN_HEIGHT - (columns[ghost.columnIndex]?.length ?? 0) + 0.5 - 1}
          r={0.5}
          style={{ opacity: 2 / 3 }}
          fill={ghost.playerType === "PlayerOne" ? playerOneFill : playerTwoFill}
        />
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
              disabled || !onClick
                ? undefined
                : (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                  ? "not-allowed"
                  : "pointer",
          }}
          onMouseOver={() => {
            if (!disabled && isColumnIndex(columnIndex) && onHover) {
              onHover(columnIndex)
            }
          }}
          onClick={() => {
            if (!disabled && isColumnIndex(columnIndex) && onClick) {
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



const ViewColumnsCanvas = ({
  columns,
  onClick,
}: ViewColumnsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")

    if (!context) {
      return
    }

    context.canvas.height = (MAX_COLUMN_HEIGHT / COLUMN_COUNT) * context.canvas.width

    paint(context, columns)
  }, [columns])


  return (
    <canvas
      style={{ width: "100%" }}
      ref={canvasRef}
      onClick={(event) => {
        console.log({
          value: event.pageX - event.currentTarget.offsetLeft,
          from: [0, event.currentTarget.width],
          to: [0, COLUMN_COUNT],
        })
        const columnIndex = Math.floor(
          rescale({
            value: event.pageX - event.currentTarget.offsetLeft,
            from: [0, event.currentTarget.width],
            to: [0, COLUMN_COUNT],
          }),
        )

        if (onClick && isColumnIndex(columnIndex)) {
          onClick(columnIndex)
          return
        }
      }}
    />
  )
}

type Range = [number, number]

const rescale = ({
  value,
  from,
  to,
}: {
  value: number
  from: Range
  to: Range
}) => {
  return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0]
}


const paint = (context: CanvasRenderingContext2D, columns: Columns): void => {

  const width = context.canvas.width
  const height = context.canvas.height

  // put origin on bottom left
  context.translate(0, height);
  context.scale(1, -1);

  context.fillStyle = gameTheme.primary.darker
  context.fillRect(0, 0, width, height)


  const cellWidth = width / COLUMN_COUNT
  const cellHeight = height / MAX_COLUMN_HEIGHT

  for (let x = 0; x < columns.length; x++) {
    const column = columns[x]

    if (!column) {
      continue
    }

    for (let y = 0; y < column.length; y++) {
      const slot = column[y]

      if (!slot) {
        continue
      }

      const cx = (x + 1 / 2) * cellWidth
      const cy = (y + 1 / 2) * cellHeight
      const r = (cellWidth / 2)

      context.beginPath()

      context.arc(cx, cy, r, 0, Math.PI * 2)

      const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r * 0.74);
      gradient.addColorStop(0, gameTheme[slot].light);
      gradient.addColorStop(1, gameTheme[slot].dark);
      context.fillStyle = gradient
      context.fill()

      context.closePath()
    }
  }


  // this is a hack that prevents a bug when creating the holes in board using the evenodd fill method
  context.beginPath()
  context.arc(width + cellWidth, height + cellHeight, cellWidth / 2, 0, Math.PI * 2)
  context.fillStyle = "purple"
  context.fill()
  context.closePath()

  // 
  //
  //
  //


  for (let x = 0; x < COLUMN_COUNT; x++) {
    for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
      const cx = (x + 1 / 2) * cellWidth
      const cy = (y + 1 / 2) * cellHeight
      const r = (cellWidth / 2) * 0.8
      context.moveTo(cy, cy)
      context.arc(cx, cy, r, 0, Math.PI * 2)
    }
  }

  context.fillStyle = gameTheme.primary.light
  context.rect(0, 0, width, height)
  context.fill("evenodd")
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
