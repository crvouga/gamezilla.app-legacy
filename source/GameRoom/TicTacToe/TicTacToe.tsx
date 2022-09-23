import { Result } from "../../Core"
import * as Store from "../../Store"

//
//
//
// Model
//
//
//

export type PlayerType = "X" | "O"

export const toOpposite = (playerType: PlayerType): PlayerType => {
  switch (playerType) {
    case "O": {
      return "X"
    }

    case "X": {
      return "O"
    }
  }
}

export type Slot = PlayerType | "Empty"

export type Row = 0 | 1 | 2

export type Column = 0 | 1 | 2

export type Board = {
  [key in Column]: {
    [key in Row]: Slot
  }
}

export const emptyBoard: Board = {
  "0": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
  "1": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
  "2": {
    "0": "Empty",
    "1": "Empty",
    "2": "Empty",
  },
}

export type Position = { row: Row; column: Column }

export const toSlot = (board: Board, position: Position): Slot =>
  board[position.column][position.row]

export const setSlot = (
  board: Board,
  { column, row }: Position,
  slot: Slot,
): Board => ({
  ...board,
  [column]: {
    ...board[column],
    [row]: slot,
  },
})

export const allPositions: Position[] = [
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 0, column: 2 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 2, column: 0 },
  { row: 2, column: 1 },
  { row: 2, column: 2 },
]

export const toSlots = (board: Board): Slot[] => {
  return Object.values(board).flatMap((column) => Object.values(column))
}

export const allWinningGroups: Position[][] = [
  // vertical
  [
    { row: 0, column: 0 },
    { row: 1, column: 0 },
    { row: 2, column: 0 },
  ],
  [
    { row: 0, column: 1 },
    { row: 1, column: 1 },
    { row: 2, column: 1 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 2 },
    { row: 2, column: 2 },
  ],
  // horizontal
  [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
  ],
  [
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
  ],
  [
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
  ],
  // diagonal
  [
    { row: 0, column: 0 },
    { row: 1, column: 1 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 1 },
    { row: 2, column: 0 },
  ],
]

type Winner = PlayerType | "None"

type Wins = { X: Position[][]; O: Position[][]; None: Position[][] }

const toWins = (board: Board): Wins => {
  return allWinningGroups.reduce(
    (wins, winningGroup) => {
      const slots = winningGroup.map((position) => toSlot(board, position))

      const winner: Winner = slots.every((slot) => slot === "X")
        ? "X"
        : slots.every((slot) => slot === "O")
          ? "O"
          : "None"

      return { ...wins, [winner]: [...wins[winner], winningGroup] }
    },
    {
      X: [],
      O: [],
      None: [],
    },
  )
}

export type Status = { type: "Turn"; turn: PlayerType } | GameOver

export type GameOver = { type: "Win"; winner: PlayerType } | { type: "Tie" }

export const toGameOver = (board: Board): GameOver | { type: "None" } => {
  const wins = toWins(board)

  if (wins.X.length > 0) {
    return { type: "Win", winner: "X" }
  }

  if (wins.O.length > 0) {
    return { type: "Win", winner: "O" }
  }

  if (isTie(board)) {
    return { type: "Tie" }
  }

  return { type: "None" }
}

export const toStatus = (board: Board): Status => {
  const gameOver = toGameOver(board)

  if (gameOver.type === "None") {
    return { type: "Turn", turn: toTurn(board) }
  }

  return gameOver
}

const isTie = (board: Board): boolean => {
  const wins = toWins(board)
  return toSlotFrequency(board).Empty === 0 && wins.O.length === 0 && wins.X.length === 0
}

type SlotFrequency = { X: number; O: number; Empty: number }

const toSlotFrequency = (board: Board): SlotFrequency => {
  return toSlots(board).reduce(
    (frequency, slot) => ({ ...frequency, [slot]: frequency[slot] + 1 }),
    { X: 0, O: 0, Empty: 0 },
  )
}

export const toTurn = (board: Board): PlayerType => {
  const frequency = toSlotFrequency(board)
  return frequency["X"] <= frequency["O"] ? "X" : "O"
}

export type MoveProblem = "not_players_turn" | "position_is_taken" | "game_over"

export const move = (
  board: Board,
  player: PlayerType,
  position: Position,
): Result.Result<MoveProblem, Board> => {
  const status = toStatus(board)

  if (status.type === "Tie" || status.type === "Win") {
    return Result.Err("game_over")
  }

  if (status.turn !== player) {
    return Result.Err("not_players_turn")
  }

  const slot = toSlot(board, position)

  if (slot !== "Empty") {
    return Result.Err("not_players_turn")
  }

  return Result.Ok(setSlot(board, position, player))
}

export const toEmptyPositions = (board: Board): Position[] => {
  return allPositions.filter(position => toSlot(board, position) === 'Empty')
}

//
//
//
// View Board
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
}

export const ViewBoard = ({
  board,
  onClick,
}: {
  board: Board
  onClick: (position: Position) => void
}) => {
  return (
    <svg

      width={"100%"}
      viewBox="0 0 3 3"
      style={{
        // maxHeight: 360,
        backgroundColor: theme.background
      }}
    >
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}
      {allPositions.map((position) => (
        <ViewSlot
          key={[position.column, position.row, toSlot(board, position)].join(
            " ",
          )}
          slot={toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {allPositions.map((position) => (
        <rect
          key={[position.column, position.row, toSlot(board, position)].join(
            " ",
          )}
          style={{ cursor: "pointer" }}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  )
}

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
]

export const ViewSlot = ({
  slot,
  cx,
  cy,
  r,
  color,
  strokeWidth
}: {
  color?: string
  strokeWidth?: number
  slot: Slot
  r: number
  cx: number
  cy: number
}) => {
  switch (slot) {
    case "Empty":
      return <g></g>

    case "O":
      return (
        <Naught
          strokeWidth={strokeWidth}
          color={color}
          r={r}
          cx={cx}
          cy={cy}
        />
      )

    case "X":
      return (
        <Cross
          strokeWidth={strokeWidth}
          color={color}
          r={r}
          cx={cx}
          cy={cy}
        />
      )
  }
}

const Cross = ({
  cx,
  cy,
  r,
  color = theme.cross,
  strokeWidth = 0.1,
}: {
  color?: string
  r: number
  cx: number
  cy: number
  strokeWidth?: number
}) => {
  return (
    <g
      strokeWidth={strokeWidth}
      stroke={color}
    >
      {/* direction: \ */}
      <line
        x1={cx - r}
        y1={cy - r}
        x2={cx + r}
        y2={cy + r}
      />
      {/* direction: / */}
      <line
        x1={cx + r}
        y1={cy - r}
        x2={cx - r}
        y2={cy + r}
      />
    </g>
  )
}

const Naught = ({
  cx,
  cy,
  r,
  color = theme.naught,
  strokeWidth = 0.1,
}: {
  color?: string
  strokeWidth?: number
  r: number
  cx: number
  cy: number
}) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  )
}

const VersusScreen = ({ store }: { store: Store.Model }) => {
  const profileX = undefined

  const profileO = undefined

  return (
    <svg
      width="100%"
      viewBox="0 0 1 1"
    >
      <rect
        width="100%"
        height="100%"
        fill={theme.background}
      />

      <mask id="avatar">
        <rect
          x={0}
          y={0}
          width={1}
          height={1}
          fill="black"
        />
        <circle
          cx={0.5}
          cy={0.5}
          r={0.5}
          fill="white"
        />
      </mask>

      {profileX && (
        <>
          <Cross
            cx={0.15}
            cy={0.25}
            r={0.075}
            strokeWidth={0.05}
          />
          <SvgAvatar
            id="x-avatar"
            cx={0.4}
            cy={0.25}
            r={0.1}
            src={""}
          />
        </>
      )}

      {profileO && (
        <>
          <Naught
            cx={0.55}
            cy={0.75}
            r={0.075}
            strokeWidth={0.05}
          />
          <SvgAvatar
            id="o-avatar"
            cx={0.8}
            cy={0.75}
            r={0.1}
            src={""}
          />
        </>
      )}

      <line
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stroke={theme.line}
        strokeWidth={0.0333}
      />
      <circle
        cx={0.5}
        cy={0.5}
        r={0.1}
        fill={theme.line}
      />
      <text
        dominantBaseline={"middle"}
        textAnchor={"middle"}
        x={0.5}
        y={0.5}
        fontSize={0.15}
        fill={"#fff"}
        r={0.15}
      >
        vs
      </text>
    </svg>
  )
}

const SvgAvatar = ({
  id,
  src,
  cx,
  cy,
  r,
}: {
  id: string
  src: string
  cx: number
  cy: number
  r: number
}) => {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="#FFFFFF"
          />
        </clipPath>
      </defs>
      <image
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        xlinkHref={src}
        href={src}
        clipPath={`url(#${id})`}
      />
    </>
  )
}

