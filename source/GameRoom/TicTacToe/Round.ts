import * as TicTacToe from "./TicTacToe"

export type Round =
    | {
        type: "Starting",
        countDown: number
    }
    | {
        type: "Started",
        board: TicTacToe.Board
        moveCountDown: number
    }
    | {
        type: "RoundOver",
        roundOver: TicTacToe.GameOver
        board: TicTacToe.Board,
        next: Round
    }

export const toCurrent = (round: Round): Round => {
    switch (round.type) {
        case 'RoundOver': {
            return toCurrent(round.next)
        }

        case 'Started': {
            return round
        }

        case 'Starting': {
            return round
        }
    }
}

export const toLatestBoard = (round: Round): TicTacToe.Board | null => {
    switch (round.type) {
        case 'Starting': {
            return null
        }

        case 'Started': {
            return round.board
        }

        case 'RoundOver': {
            const next = toLatestBoard(round.next)

            if (next) {
                return next
            }

            return round.board
        }
    }
}

export const toCount = (round: Round): number => {
    switch (round.type) {
        case 'RoundOver': {
            return 1 + toCount(round.next)
        }

        case 'Started': {
            return 1
        }

        case 'Starting': {
            return 1
        }
    }

}

export const mapCurrent = (round: Round, updater: (current: Round) => Round): Round => {
    switch (round.type) {
        case 'RoundOver': {
            return {
                ...round,
                next: mapCurrent(round.next, updater)
            }
        }

        case 'Started': {
            return updater(round)
        }

        case 'Starting': {
            return updater(round)
        }
    }
}

export const toScore = (round: Round): { X: number, O: number, Tie: number } => {
    switch (round.type) {
        case 'RoundOver': {
            const nextScore = toScore(round.next)

            switch (round.roundOver.type) {
                case 'Tie': {
                    return {
                        ...nextScore,
                        Tie: nextScore.Tie + 1
                    }
                }

                case 'Win': {
                    return {
                        ...nextScore,
                        [round.roundOver.winner]: nextScore[round.roundOver.winner] + 1
                    }
                }
            }
        }

        case 'Starting': {
            return { X: 0, O: 0, Tie: 0 }
        }

        case 'Started': {
            return { X: 0, O: 0, Tie: 0 }
        }

    }
}

export type GameOver = {
    type: "Winner",
    winner: TicTacToe.PlayerType,
} | {
    type: "Tie"
}

export const toGameOver = ({ maxRoundCount, round }: { maxRoundCount: number, round: Round }): GameOver | { type: "None" } => {
    const score = toScore(round)
    const winCount = (maxRoundCount + 1) / 2

    if (score.X >= winCount) {
        return { type: "Winner", winner: "X" }
    }

    if (score.O >= winCount) {
        return { type: "Winner", winner: "O" }
    }

    if (score.Tie >= winCount) {
        return { type: "Tie", }
    }

    const roundCount = toCount(round)

    if (roundCount >= maxRoundCount) {
        return { type: "Tie" }
    }

    return { type: "None" }
}