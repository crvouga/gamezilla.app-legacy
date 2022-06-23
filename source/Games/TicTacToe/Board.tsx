//
//
//
// Model
//
//
//

export type Player = "X" | "O"

export type Slot = Player | "Empty"

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

const allPositions: Position[] = [
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

type Winner = Player | "None"

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

type Status =
  | { type: "Turn"; turn: Player }
  | { type: "Win"; winner: Player }
  | { type: "Tie" }

export const toStatus = (board: Board): Status => {
  const wins = toWins(board)

  if (wins.X.length > 0) {
    return { type: "Win", winner: "X" }
  }

  if (wins.O.length > 0) {
    return { type: "Win", winner: "O" }
  }

  return { type: "Turn", turn: toTurn(board) }
}

type SlotFrequency = { X: number; O: number; Empty: number }

const toSlotFrequency = (board: Board): SlotFrequency => {
  return toSlots(board).reduce(
    (frequency, slot) => ({ ...frequency, [slot]: frequency[slot] + 1 }),
    { X: 0, O: 0, Empty: 0 },
  )
}

export const toTurn = (board: Board): Player => {
  const frequency = toSlotFrequency(board)
  return frequency["X"] <= frequency["O"] ? "X" : "O"
}

export const move = (
  board: Board,
  player: Player,
  position: Position,
): Board => {
  const status = toStatus(board)

  if (
    status.type === "Turn" &&
    status.turn === player &&
    toSlot(board, position) === "Empty"
  ) {
    return setSlot(board, position, player)
  }

  return board
}

//
//
//
// View
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
}

export const Board = ({
  board,
  onClick,
}: {
  board: Board
  onClick: (position: Position) => void
}) => {
  return (
    <svg width={"100%"} viewBox="0 0 3 3">
      <rect width="100%" height="100%" fill={theme.background} />
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
        <Slot
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

export const Slot = ({
  slot,
  cx,
  cy,
  r,
}: {
  slot: Slot
  r: number
  cx: number
  cy: number
}) => {
  switch (slot) {
    case "Empty":
      return <g></g>

    case "O":
      return <Naught r={r} cx={cx} cy={cy} />

    case "X":
      return <Cross r={r} cx={cx} cy={cy} />
  }
}

const Cross = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <g strokeWidth={0.1} stroke={theme.cross}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  )
}

const Naught = ({ cx, cy, r }: { r: number; cx: number; cy: number }) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={theme.naught}
      strokeWidth={0.1}
      fill="transparent"
    />
  )
}
