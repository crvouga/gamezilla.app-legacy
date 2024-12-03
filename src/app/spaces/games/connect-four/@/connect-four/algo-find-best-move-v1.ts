import { type ChildrenFn, Minimax, type ScoreFn } from '~/app/spaces/games/@/minimax'
import type { Result } from '~/@/core'
import { type Columns, MAX_COLUMN_HEIGHT, type PlayerType, opposite, toStatus } from './connect-four'

export type BestMoveProblem = 'no_move_available'

export type BestMoveResult = Result<BestMoveProblem, number | null>

type State = {
  columns: Columns
  lastMoveColumnIndex: number | null
  turn: PlayerType
}

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0]

const childrenFn: ChildrenFn<State> = (modelCore) => {
  const children: State[] = []

  const turnNew = opposite[modelCore.turn]

  for (const columnIndex of COLUMN_INDEX_ORDER) {
    const column = modelCore.columns[columnIndex]

    if (!column) {
      continue
    }

    if (column.length >= MAX_COLUMN_HEIGHT) {
      continue
    }

    const copied: Columns = [
      ...modelCore.columns.slice(0, columnIndex),
      [...column, modelCore.turn],
      ...modelCore.columns.slice(columnIndex + 1)
    ]

    children.push({
      columns: copied,
      turn: turnNew,
      lastMoveColumnIndex: columnIndex
    })
  }

  return children
}

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth
}: {
  maxDepth: number
  maximizingPlayer: PlayerType
  columns: Columns
}): {
  columnIndex: number | null
} => {
  const scoreFn: ScoreFn<State> = (modelCore) => {
    const status = toStatus(modelCore.columns)

    if (status.type !== 'Winner') {
      return 0
    }

    if (status.winner !== maximizingPlayer) {
      return Number.NEGATIVE_INFINITY
    }

    return Number.POSITIVE_INFINITY
  }

  const bestChildState = Minimax.findBestChildState({
    scoreFn,
    childrenFn,
    maxDepth,
    parentState: {
      columns,
      turn: maximizingPlayer,
      lastMoveColumnIndex: null
    }
  })

  const bestMove = bestChildState?.lastMoveColumnIndex ?? null

  return {
    columnIndex: bestMove
  }
}

export const ConnectFourBotWorker = {
  findBestMove
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
