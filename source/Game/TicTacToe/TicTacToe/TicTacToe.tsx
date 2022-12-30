import * as Threads from "threads"
import { memoize } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { Task } from "../../../Core/Task"
import * as UI from "../../../UI"
import { Minimax } from "../../Minimax"

//
//
//
// Model
//
//
//

export type PlayerType = "X" | "O"

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  X: "X",
  O: "O",
}

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

type Empty = "_"

export const Empty: Empty = "_"

export type Slot = PlayerType | Empty

export type Row = 0 | 1 | 2

export type Column = 0 | 1 | 2

export type Board = [[Slot, Slot, Slot], [Slot, Slot, Slot], [Slot, Slot, Slot]]


const toChildren = (board: Board): Board[] => {
  const turn = toTurn(board)

  const boards: Board[] = []

  for (const position of allPositions) {
    const result = move({ board, player: turn, position })

    if (result.type === "Ok") {
      boards.push(result.value)
    }
  }

  return boards
}

export type BotLevel = "Easy" | "Medium" | "Impossible"

export const botLevels: { [botLevel in BotLevel]: BotLevel } = {
  Easy: "Easy",
  Medium: "Medium",
  Impossible: "Impossible",
}

export const toDepth = (botLevel: BotLevel): number => {
  switch (botLevel) {
    case "Easy": {
      return 2
    }
    case "Medium": {
      return 3
    }
    case "Impossible": {
      return 6
    }
  }
}

const toScore = ({
  board,
  maximizingPlayer,
}: {
  board: Board
  maximizingPlayer: PlayerType
}): number => {
  const gameOver = toGameOver(board)

  switch (gameOver.type) {
    case "None": {
      return 0
    }

    case "Tie": {
      return 0
    }

    case "Win": {
      if (gameOver.winner === maximizingPlayer) {
        return 2
      }

      return -1
    }
  }
}

export const toBestMove = ({
  depth,
  maximizingPlayer,
  board,
}: {
  depth: number
  maximizingPlayer: PlayerType
  board: Board
}): Result<ToBestMoveProblem, Position> => {
  const minimax = Minimax.create({
    toChildren,
    toScore: (board) => toScore({ board, maximizingPlayer }),
  })

  const bestMove = maxBy(allPositions, (position) => {
    const result = move({ board, player: maximizingPlayer, position })

    if (result.type === "Err") {
      return -Infinity
    }

    const score = minimax({ state: result.value, depth })

    return score
  })

  return Ok(bestMove)
}

export type ToBestMoveProblem = "no_valid_move"

export const toBestMove_ = ({
  maximizingPlayer,
  board,
}: {
  depth: number
  maximizingPlayer: PlayerType
  board: Board
}): Result<ToBestMoveProblem, Position> => {
  for (const position of allPositions) {
    const result = move({ board, player: maximizingPlayer, position })
    if (result.type === "Ok") {
      return Ok(position)
    }
  }

  return Err("no_valid_move")
}

export type Worker = {
  toBestMove: typeof toBestMove
}

export type GetBestMoveProblem = "worker_thread_error" | ToBestMoveProblem



export const findBestMove =
  ({
    board,
    depth,
    maximizingPlayer,
  }: {
    depth: number
    maximizingPlayer: PlayerType
    board: Board
  }): Task<Result<GetBestMoveProblem, Position>> =>
    async () => {
      // const result = toBestMove({ board, depth, maximizingPlayer })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // return result

      try {
        // docs: https://threads.js.org/
        const worker = new Threads.Worker("./worker")

        const spawned = await Threads.spawn<Worker>(worker)

        try {
          const result = await spawned.toBestMove({ depth, maximizingPlayer, board })
          return result
        } catch (error) {
          return Err("worker_thread_error")
        } finally {
          await Threads.Thread.terminate(spawned)
        }
      } catch (error) {
        return Err("worker_thread_error")
      }
    }

type NonEmpty<T> = [T, ...T[]]

const maxBy = <X,>(xs: NonEmpty<X>, toValue: (x: X) => number): X => {
  let runningMax = xs[0]

  for (const x of xs) {
    if (toValue(x) > toValue(runningMax)) {
      runningMax = x
    }
  }

  return runningMax
}

export const emptyBoard: Board = [
  ["_", "_", "_"],
  ["_", "_", "_"],
  ["_", "_", "_"],
]

export type Position = { row: Row; column: Column }

export const toSlot = (board: Board, position: Position): Slot =>
  board[position.column][position.row]

export const setSlot = (
  board: Board,
  position: Position,
  slotNew: Slot,
): Board => {
  return board.map((columns, columnIndex) =>
    columns.map((slot, rowIndex) =>
      columnIndex === position.column && rowIndex === position.row
        ? slotNew
        : slot,
    ),
  ) as Board
}

export const allPositions: NonEmpty<Position> = [
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

type WinningGroup = [Position, Position, Position]

export const allWinningGroups: WinningGroup[] = [
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

type Wins = { X: WinningGroup[]; O: WinningGroup[]; None: WinningGroup[] }

let n = 0
const toWins = memoize(x => JSON.stringify(x), (board: Board): Wins => {
  console.log("toWins", n++)
  const wins: Wins = {
    X: [],
    O: [],
    None: [],
  }

  for (let i = 0; i < allWinningGroups.length; i++) {
    const group = allWinningGroups[i]!
    const a = toSlot(board, group[0])
    const b = toSlot(board, group[1])
    const c = toSlot(board, group[2])

    const key: keyof typeof wins =
      a === "X" && b === "X" && c === "X"
        ? "X"
        : a === "O" && b === "O" && c === "O"
          ? "O"
          : "None"

    wins[key].push(group)
  }

  return wins
})

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
  return (
    wins.O.length === 0 && wins.X.length === 0 && toSlotFrequency(board)._ === 0
  )
}

type SlotFrequency = { X: number; O: number; _: number }

const toSlotFrequency = (board: Board): SlotFrequency => {
  const frequency: SlotFrequency = { X: 0, O: 0, _: 0 }

  for (let i = 0; i < allPositions.length; i++) {
    const position = allPositions[i]!
    const slot = toSlot(board, position)
    frequency[slot] += 1
  }

  return frequency
}


export const toTurn = (board: Board): PlayerType => {
  const frequency = toSlotFrequency(board)
  return frequency["X"] <= frequency["O"] ? "X" : "O"
}

export type MoveProblem = "not_players_turn" | "position_is_taken" | "game_over"

export const move = ({
  board,
  player,
  position,
}: {
  board: Board
  player: PlayerType
  position: Position
}): Result<MoveProblem, Board> => {
  const status = toStatus(board)

  if (status.type === "Tie" || status.type === "Win") {
    return Err("game_over")
  }

  if (status.turn !== player) {
    return Err("not_players_turn")
  }

  const slot = toSlot(board, position)

  if (slot !== Empty) {
    return Err("position_is_taken")
  }

  const boardNext = setSlot(board, position, player)

  return Ok(boardNext)
}

export const toEmptyPositions = (board: Board): Position[] => {
  return allPositions.filter((position) => toSlot(board, position) === Empty)
}

//
//
//
// View Board
//
//
//

export const gameTheme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
  text: "#fff",
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
        backgroundColor: gameTheme.background,
      }}
    >
      <g>
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={gameTheme.line}
            strokeWidth={0.1}
          />
        ))}
      </g>

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
          style={{
            cursor: "pointer",
          }}
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
  strokeWidth,
}: {
  color?: string
  strokeWidth?: number
  slot: Slot
  r: number
  cx: number
  cy: number
}) => {
  switch (slot) {
    case Empty:
      return <g></g>

    case "O":
      return (
        <Naught strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
      )

    case "X":
      return (
        <Cross strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
      )
  }
}

const Cross = ({
  cx,
  cy,
  r,
  color = gameTheme.cross,
  strokeWidth = 0.1,
}: {
  color?: string
  r: number
  cx: number
  cy: number
  strokeWidth?: number
}) => {
  return (
    <g strokeWidth={strokeWidth} stroke={color}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  )
}

const Naught = ({
  cx,
  cy,
  r,
  color = gameTheme.naught,
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

export const PlayerTypeIcon = ({
  playerType,
  sx,
}: {
  playerType: PlayerType
  sx?: UI.Sx
}) => {
  return (
    <UI.SvgIcon viewBox="-1 -1 2 2" sx={sx}>
      <ViewSlot
        cx={0}
        cy={0}
        slot={playerType}
        r={2 / 3}
        color="currentColor"
        strokeWidth={0.33}
      />
    </UI.SvgIcon>
  )
}


// 
// 
// 
// 
// 

export const viewCoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, Empty],
    [{ row: 1, column: 0 }, Empty],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg width="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={gameTheme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}

// 
// 
// 
// 
// 

type State = {
  board: Board
  turn: PlayerType
}

export const toNextStates = (state: State): State[] => {
  const nextStates: State[] = []

  for (const position of allPositions) {
    const slot = toSlot(state.board, position)

    if (slot !== '_') {
      continue
    }

    nextStates.push({
      board: setSlot(state.board, position, state.turn),
      turn: toOpposite(state.turn)
    })
  }

  return nextStates
}


