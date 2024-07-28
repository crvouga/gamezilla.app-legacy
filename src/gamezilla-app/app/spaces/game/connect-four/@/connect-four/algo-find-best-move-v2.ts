import { type ChildrenFn, Minimax, type ScoreFn } from 'gamezilla-app/app/spaces/game/@/minimax'
import { Ok, type Result } from 'gamezilla-app/@/core'
import { type Columns, MAX_COLUMN_HEIGHT, type PlayerType, opposite, toStatus } from './connect-four'

export type BestMoveProblem = 'no_move_available'

export type BestMoveResult = Result<BestMoveProblem, { columnIndex: number | null }>

type State = {
  columns: Columns
  lastMoveColumnIndex: number | null
  turn: PlayerType
}

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0]

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth
}: {
  maxDepth: number
  maximizingPlayer: PlayerType
  columns: Columns
}): BestMoveResult => {
  const childrenFn: ChildrenFn<State> = (modelCore) => {
    const children: State[] = []

    for (const columnIndex of COLUMN_INDEX_ORDER) {
      const column = modelCore.columns[columnIndex]

      if (!column) {
        continue
      }

      if (column.length >= MAX_COLUMN_HEIGHT) {
        continue
      }

      const columnsNew: Columns = modelCore.columns.map((column) => column.map((slot) => slot))

      columnsNew[columnIndex] = [...column, modelCore.turn]

      children.push({
        columns: columnsNew,
        turn: opposite[modelCore.turn],
        lastMoveColumnIndex: columnIndex
      })
    }

    return children
  }

  const scoreFn: ScoreFn<State> = (modelCore) => {
    const status = toStatus(modelCore.columns)

    if (status.type !== 'Winner') {
      return 0
    }

    if (status.winner !== maximizingPlayer) {
      return Number.POSITIVE_INFINITY
    }

    return Number.NEGATIVE_INFINITY
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

  return Ok({
    columnIndex: bestMove
  })
}

export const ConnectFourBotWorker = {
  findBestMove
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
