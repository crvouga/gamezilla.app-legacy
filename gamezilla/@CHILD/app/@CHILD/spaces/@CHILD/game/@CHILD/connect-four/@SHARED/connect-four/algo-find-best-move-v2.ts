import {
    ChildrenFn,
    Minimax,
    ScoreFn,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/minimax"
import { ok, Result } from "gamezilla/@SHARED/core"
import {
    Columns,
    MAX_COLUMN_HEIGHT,
    opposite,
    PlayerType,
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
    const childrenFn: ChildrenFn<State> = (modelGame) => {
        const children: State[] = []

        for (const columnIndex of COLUMN_INDEX_ORDER) {
            const column = modelGame.columns[columnIndex]

            if (!column) {
                continue
            }

            if (column.length >= MAX_COLUMN_HEIGHT) {
                continue
            }

            const columnsNew: Columns = modelGame.columns.map((column) =>
                column.map((slot) => slot),
            )

            columnsNew[columnIndex] = [...column, modelGame.turn]

            children.push({
                columns: columnsNew,
                turn: opposite[modelGame.turn],
                lastMoveColumnIndex: columnIndex,
            })
        }

        return children
    }

    const scoreFn: ScoreFn<State> = (modelGame) => {
        const status = toStatus(modelGame.columns)

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

    return ok({
        columnIndex: bestMove,
    })
}

export const ConnectFourBotWorker = {
    findBestMove,
}

export type ConnectFourBotWorker = typeof ConnectFourBotWorker
