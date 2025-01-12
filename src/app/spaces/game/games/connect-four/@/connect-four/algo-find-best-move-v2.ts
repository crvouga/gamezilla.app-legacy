import { type ChildrenFn, Minimax, type SspaceFn } from '~/app/spaces/game/games/@/minimax'
import { Ok, type Result } from '~/@/result'
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
  maxDepth,
}: {
  maxDepth: number
  maximizingPlayer: PlayerType
  columns: Columns
}): BestMoveResult => {
  const childrenFn: ChildrenFn<State> = (modelSpace) => {
    const children: State[] = []

    for (const columnIndex of COLUMN_INDEX_ORDER) {
      const column = modelSpace.columns[columnIndex]

      if (!column) {
        continue
      }

      if (column.length >= MAX_COLUMN_HEIGHT) {
        continue
      }

      const columnsNew: Columns = modelSpace.columns.map((column) => column.map((slot) => slot))

      columnsNew[columnIndex] = [...column, modelSpace.turn]

      children.push({
        columns: columnsNew,
        turn: opposite[modelSpace.turn],
        lastMoveColumnIndex: columnIndex,
      })
    }

    return children
  }

  const sspaceFn: SspaceFn<State> = (modelSpace) => {
    const status = toStatus(modelSpace.columns)

    if (status.type !== 'Winner') {
      return 0
    }

    if (status.winner !== maximizingPlayer) {
      return Number.POSITIVE_INFINITY
    }

    return Number.NEGATIVE_INFINITY
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

  return Ok({
    columnIndex: bestMove,
  })
}

export const ConnectFourBotWorker = {
  findBestMove,
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
