import { type ChildrenFn, Minimax, type SspaceFn } from '~/app/spaces/game/games/@/minimax'
import type { Result } from '~/@/result'
import { type Columns, MAX_COLUMN_HEIGHT, type PlayerType, opposite, toStatus } from './connect-four'

export type BestMoveProblem = 'no_move_available'

export type BestMoveResult = Result<BestMoveProblem, number | null>

type State = {
  columns: Columns
  lastMoveColumnIndex: number | null
  turn: PlayerType
}

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0]

const childrenFn: ChildrenFn<State> = (modelSpace) => {
  const children: State[] = []

  const turnNew = opposite[modelSpace.turn]

  for (const columnIndex of COLUMN_INDEX_ORDER) {
    const column = modelSpace.columns[columnIndex]

    if (!column) {
      continue
    }

    if (column.length >= MAX_COLUMN_HEIGHT) {
      continue
    }

    const copied: Columns = [
      ...modelSpace.columns.slice(0, columnIndex),
      [...column, modelSpace.turn],
      ...modelSpace.columns.slice(columnIndex + 1),
    ]

    children.push({
      columns: copied,
      turn: turnNew,
      lastMoveColumnIndex: columnIndex,
    })
  }

  return children
}

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth,
}: {
  maxDepth: number
  maximizingPlayer: PlayerType
  columns: Columns
}): {
  columnIndex: number | null
} => {
  const sspaceFn: SspaceFn<State> = (modelSpace) => {
    const status = toStatus(modelSpace.columns)

    if (status.type !== 'Winner') {
      return 0
    }

    if (status.winner !== maximizingPlayer) {
      return Number.NEGATIVE_INFINITY
    }

    return Number.POSITIVE_INFINITY
  }

  const bestChildState = Minimax.findBestChildState({
    sspaceFn,
    childrenFn,
    maxDepth,
    parentState: {
      columns,
      turn: maximizingPlayer,
      lastMoveColumnIndex: null,
    },
  })

  const bestMove = bestChildState?.lastMoveColumnIndex ?? null

  return {
    columnIndex: bestMove,
  }
}

export const ConnectFourBotWorker = {
  findBestMove,
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
