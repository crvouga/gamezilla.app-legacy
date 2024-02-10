import { Posix } from "gamezilla/@SHARED/core"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
    ColumnIndex,
    Columns,
    EMPTY_COLUMNS,
    MoveProblem,
    PlayerType,
    dropDisc,
    toStatus,
    toTurn,
} from "../../@SHARED/connect-four/connect-four"
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"

//
//
//
// Model
//
//
//

export type ModelClient = {
    openedModal: "confirm-resign" | null
    ghostIndex: ColumnIndex | null
}

export type ModelServer = null

//
//
//
// Msg
//
//
//

export type MsgServer = { t: null }

export type MsgClient =
    | MsgGame
    | { t: "hovered-over-columns"; columnIndex: ColumnIndex }
    | { t: "clicked-resign"; userId: UserId }
    | { t: "close-modal" }

export type MsgToServer = { t: null }

export type MsgToClient = { t: null }

//
//
//
//
//

export type MsgGame =
    //
    | { t: "user-stopped-playing"; userId: UserId }
    | { t: "user-started-playing"; userId: UserId; playerType: PlayerType }
    | {
          t: "user-inputted-move-time-limit"
          userId: UserId
          moveTimeLimit: MoveTimeLimit
      }
    | { t: "user-dropped-disc"; columnIndex: ColumnIndex; userId: UserId }
    | { t: "user-started-game"; userId: UserId }
    | { t: "user-stopped-game"; userId: UserId }
    | { t: "user-requested-rematch"; userId: UserId }
    | {
          t: "user-responded-to-rematch-request"
          userId: UserId
          response: "Accept" | "Decline"
      }
    | { t: "user-cancelled-rematch"; userId: UserId }
    | { t: "user-resigned"; userId: UserId }
    | { t: "time-passed"; currentTime: Posix }
    | { t: "user-left"; userId: UserId }

type EventError = { t: "not-playing" } | { t: "move"; c: MoveProblem }

export type ModelGame = StateSetup | StateGame | StateGameOver

export const initGame = (ctx: SpaceCtx): ModelGame => {
    return {
        type: "setup",
        moveTimeLimit: 5,
        players: {
            "player-one": ctx.space.hostId,
            "player-two": null,
        },
        errors: {},
    }
}

type Errors = {
    errors: {
        [eventId: string]: MsgGame & { error: EventError }
    }
}

const addError = (
    modelGame: ModelGame,
    msgGame: MsgGame,
    error: EventError,
): ModelGame => {
    return {
        ...modelGame,
        errors: {
            ...modelGame.errors,
            [JSON.stringify(msgGame)]: { ...msgGame, error },
        },
    }
}

export type StateSetup = Errors & {
    type: "setup"
    moveTimeLimit: MoveTimeLimit
    players: {
        [playerType in PlayerType]: UserId | null
    }
}

export type StateGame = Errors & {
    type: "game"
    moveTimeLimit: MoveTimeLimit
    columns: Columns
    gameId: number
    lastMoveAt: Posix
    players: {
        [playerType in PlayerType]: UserId
    }
}

export type StateGameOver = Errors & {
    type: "game-over"
    moveTimeLimit: MoveTimeLimit
    columns: Columns
    gameId: number
    gameOver: GameOver
    rematch: Rematch
    players: {
        [playerType in PlayerType]: UserId
    }
}
export type Rematch =
    | {
          type: "NotAsking"
      }
    | {
          type: "Asking"
          asker: PlayerType
      }

export type GameOver =
    | {
          type: "Draw"
      }
    | {
          type: "Winner"
          winner: PlayerType
      }
    | {
          type: "resignation"
          resigner: PlayerType
      }

export const toGameOver = (
    modelGame: ModelGame,
): GameOver | { type: "none" } => {
    if (modelGame.type === "setup") {
        return { type: "none" }
    }

    const status = toStatus(modelGame.columns)

    if (status.type === "Tie") {
        return { type: "Draw" }
    }

    if (status.type === "Winner") {
        return { type: "Winner", winner: status.winner }
    }

    return { type: "none" }
}

export type MoveTimeLimit = 5 | 7 | 9

export const allMoveTimeLimit: {
    [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit
} = {
    "5": 5,
    "7": 7,
    "9": 9,
}

export const reducer = (modelGame: ModelGame, msgGame: MsgGame): ModelGame => {
    switch (modelGame.type) {
        case "setup": {
            switch (msgGame.t) {
                case "user-started-playing": {
                    if (modelGame.players[msgGame.playerType] !== null) {
                        return addError(modelGame, msgGame, {
                            t: "not-playing",
                        })
                    }

                    return {
                        ...modelGame,
                        players: {
                            ...modelGame.players,
                            [msgGame.playerType]: msgGame.userId,
                        },
                    }
                }

                case "user-stopped-playing": {
                    const playerType = toPlayerType(msgGame.userId, modelGame)

                    if (!playerType) {
                        return addError(modelGame, msgGame, {
                            t: "not-playing",
                        })
                    }

                    return {
                        ...modelGame,
                        players: {
                            ...modelGame.players,
                            [playerType]: null,
                        },
                    }
                }

                case "user-inputted-move-time-limit": {
                    return {
                        ...modelGame,
                        moveTimeLimit: msgGame.moveTimeLimit,
                    }
                }

                case "user-started-game": {
                    const playerOne = modelGame.players["player-one"]
                    const playerTwo = modelGame.players["player-two"]

                    if (!playerOne || !playerTwo) {
                        return addError(modelGame, msgGame, {
                            t: "not-playing",
                        })
                    }

                    return {
                        errors: modelGame.errors,
                        type: "game",
                        columns: EMPTY_COLUMNS,
                        moveTimeLimit: modelGame.moveTimeLimit,
                        lastMoveAt: Posix.now(),
                        gameId: 0,
                        players: {
                            "player-one": playerOne,
                            "player-two": playerTwo,
                        },
                    }
                }

                default: {
                    return modelGame
                }
            }
        }

        case "game": {
            switch (msgGame.t) {
                case "user-dropped-disc": {
                    const turn = toTurn(modelGame.columns)

                    const dropped = dropDisc(
                        modelGame.columns,
                        msgGame.columnIndex,
                        turn,
                    )

                    if (dropped.t === "err") {
                        return addError(modelGame, msgGame, {
                            t: "move",
                            c: dropped.error,
                        })
                    }

                    return {
                        ...modelGame,
                        columns: dropped.value,
                        // lastMoveAt: msgGame.happenedAt,
                    }
                }

                case "user-resigned": {
                    const resignedPlayer = toPlayerType(
                        msgGame.userId,
                        modelGame,
                    )

                    if (!resignedPlayer) {
                        return addError(modelGame, msgGame, {
                            t: "not-playing",
                        })
                    }

                    return {
                        ...modelGame,
                        type: "game-over",
                        gameOver: {
                            type: "resignation",
                            resigner: resignedPlayer,
                        },
                        rematch: { type: "NotAsking" },
                    }
                }

                case "time-passed": {
                    return modelGame
                }
            }
            return modelGame
        }

        case "game-over": {
            return modelGame
        }
    }
}

export const toPlayerType = (
    userId: UserId,
    modelGame: ModelGame,
): PlayerType | null => {
    if (modelGame.players["player-one"] === userId) {
        return "player-one"
    }

    if (modelGame.players["player-two"] === userId) {
        return "player-two"
    }

    return null
}
