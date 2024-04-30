import {
  ChildrenFn,
  Minimax,
  ScoreFn,
} from "gamezilla-app/app/spaces/@CHILD/game/@SHARED/minimax"
import { Ok, Result } from "gamezilla-app/@SHARED/core"
import {
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  opposite,
  toStatus,
} from "./connect-four"

export type BestMoveProblem = "no_move_available"

export type BestMoveResult = Result<
  BestMoveProblem,
  { columnIndex: number | null }
>

type State = {
  columns: Columns
  lastMoveColumnIndex: number | null
  turn: PlayerType
}

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0]

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth,
}: {
  maxDepth: number
  maximizingPlayer: PlayerType
  columns: Columns
}): BestMoveResult => {
  const childrenFn: ChildrenFn<State> = (modelSync) => {
    const children: State[] = []

    for (const columnIndex of COLUMN_INDEX_ORDER) {
      const column = modelSync.columns[columnIndex]

      if (!column) {
        continue
      }

      if (column.length >= MAX_COLUMN_HEIGHT) {
        continue
      }

      const columnsNew: Columns = modelSync.columns.map((column) =>
        column.map((slot) => slot),
      )

      columnsNew[columnIndex] = [...column, modelSync.turn]

      children.push({
        columns: columnsNew,
        turn: opposite[modelSync.turn],
        lastMoveColumnIndex: columnIndex,
      })
    }

    return children
  }

  const scoreFn: ScoreFn<State> = (modelSync) => {
    const status = toStatus(modelSync.columns)

    if (status.type !== "Winner") {
      return 0
    }

    if (status.winner !== maximizingPlayer) {
      return Infinity
    }

    return -Infinity
  }

  const bestChildState = Minimax.findBestChildState({
    scoreFn,
    childrenFn,
    maxDepth,
    parentState: {
      columns,
      turn: maximizingPlayer,
      lastMoveColumnIndex: null,
    },
  })

  const bestMove = bestChildState?.lastMoveColumnIndex ?? null

  return Ok({
    columnIndex: bestMove,
  })
}

export const ConnectFourBotWorker = {
  findBestMove,
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
