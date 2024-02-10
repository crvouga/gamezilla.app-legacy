import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { err, NonEmpty, ok, Result } from "gamezilla/@SHARED/core"
import {
    Board,
    MoveProblem,
    Stone,
    Win,
    initBoard,
    move,
    toOppositeStone,
    toStatus,
} from "../../@SHARED/gomoku/gomoku"
import { Position } from "../../@SHARED/gomoku/gomoku-position"

//
//
//
// Model
//
//
//

export type Model = ModelSetup | ModelPlaying | ModelGameOver

export type ModelSetup = {
    type: "setup"
    white: UserId | null
    black: UserId | null
}

export type ModelPlaying = {
    type: "playing"
    white: UserId
    black: UserId
    board: Board
}

export type ModelGameOver = {
    type: "game-over"
    white: UserId
    black: UserId
    board: Board
    gameOver: GameOver
    rematch: Rematch
}

type Rematch =
    | {
          type: "none"
      }
    | {
          type: "Requested"
      }

type GameOver =
    | {
          type: "resigned"
          resigner: Stone
      }
    | {
          type: "Winner"
          winner: Stone
          wins: NonEmpty<Win>
      }
    | {
          type: "Draw"
      }

export type ModelClient = Model & {
    confirming?: MsgClient["t"]
}

export type ModelServer = Model

export const initShared = ({
    white,
    black,
}: {
    white: UserId | null
    black: UserId | null
}): Model => {
    return {
        type: "setup",
        white,
        black,
    }
}

const initGameOver = ({
    model,
    gameOver,
}: {
    gameOver: GameOver
    model: ModelPlaying
}): ModelGameOver => {
    return {
        type: "game-over",
        black: model.black,
        white: model.white,
        board: model.board,
        rematch: { type: "none" },
        gameOver,
    }
}

const initSetup = (model: Model): ModelSetup => {
    return {
        type: "setup",
        black: model.black,
        white: model.white,
    }
}

//
//
//
// Msg
//
//
//

export type MsgClient = Req | { t: "clicked-cancel" }

export type MsgServer = { t: "none" }

export type MsgToClient = Res

export type MsgToServer = Req

//
//
//
//
//

export type Req =
    | { t: "start-playing"; stone: Stone }
    | { t: "stop-playing"; stone: Stone }
    | { t: "start-game" }
    //
    | { t: "input-move"; position: Position }
    | { t: "resign" }
    | { t: "rematch-request" }
    | { t: "rematch-respond"; response: "Accept" | "Decline" }
    | { t: "stop-game" }

export type Res = Req & { result: Result<Problem, Model> }

type Problem =
    | "must-be-setup"
    | "player-taken"
    | "must-be-player"
    | "missing-player"
    | "must-be-playing"
    | MoveProblem

export const handle = ({
    ctx,
    msg,
    model,
}: {
    ctx: { currentUserId: UserId }
    msg: Req
    model: Model
}): Result<Problem, Model> => {
    switch (msg.t) {
        case "start-playing": {
            if (model.type !== "setup") {
                return err("must-be-setup")
            }

            const { stone } = msg

            if (model[stone]) {
                return err("player-taken")
            }

            const modelNew: Model = {
                ...model,
                [stone]: ctx.currentUserId,
                [toOppositeStone(stone)]:
                    model[toOppositeStone(stone)] === ctx.currentUserId
                        ? null
                        : model[toOppositeStone(stone)],
            }

            return ok(modelNew)
        }

        case "stop-playing": {
            if (model.type !== "setup") {
                return err("must-be-setup")
            }

            const { stone } = msg

            if (model[stone] !== ctx.currentUserId) {
                return err("must-be-player")
            }

            const modelNew: Model = {
                ...model,
                [stone]: null,
            }

            return ok(modelNew)
        }

        case "start-game": {
            if (model.type !== "setup") {
                return err("must-be-setup")
            }

            if (!(model.white && model.black)) {
                return err("missing-player")
            }

            const modelNew: Model = {
                type: "playing",
                white: model.white,
                black: model.black,
                board: initBoard,
            }

            return ok(modelNew)
        }

        case "input-move": {
            if (model.type !== "playing") {
                return err("must-be-playing")
            }

            const { position } = msg

            const currentUserStone =
                model.white === ctx.currentUserId ? "white" : "black"

            const moved = move({
                board: model.board,
                position,
                stone: currentUserStone,
            })

            if (moved.t === "err") {
                return moved
            }

            const modelNew = { ...model, board: moved.value }

            const statusNew = toStatus(modelNew.board)

            if (statusNew.type === "win") {
                const gameOver: GameOver = {
                    type: "Winner",
                    winner: statusNew.winner,
                    wins: statusNew.wins,
                }
                return ok(initGameOver({ model: modelNew, gameOver }))
            }

            if (statusNew.type === "draw") {
                return ok(
                    initGameOver({
                        model: modelNew,
                        gameOver: { type: "Draw" },
                    }),
                )
            }

            return ok(modelNew)
        }

        case "resign": {
            if (model.type !== "playing") {
                return err("must-be-playing")
            }

            if (
                model.white !== ctx.currentUserId &&
                model.black !== ctx.currentUserId
            ) {
                return err("must-be-player")
            }

            const currentUserStone =
                model.white === ctx.currentUserId ? "white" : "black"

            const modelNew = initGameOver({
                model,
                gameOver: { type: "resigned", resigner: currentUserStone },
            })

            return ok(modelNew)
        }

        case "rematch-request": {
            return ok(model)
        }

        case "rematch-respond": {
            return ok(model)
        }

        case "stop-game": {
            if (
                model.black !== ctx.currentUserId &&
                model.white !== ctx.currentUserId
            ) {
                return err("must-be-player")
            }

            return ok(initSetup(model))
        }
    }
}
