import { Audio, Option, Result } from "../../Core"
import { UserId } from "../../Data"
import * as Board from "./Board"
import * as Clock from "./Clock"

//
//
//
// Model
//
//
//

export type SetupModel = {
    type: "Setup"
    botColor: Board.Color,
    userId: Option.Option<UserId.UserId>
}

export type GameModel = {
    type: "Game"
    botColor: Board.Color,
    userId: Option.Option<UserId.UserId>
    board: Board.Model
}

export type GameOverModel = {
    type: "GameOver"
    gameOver: GameOver
    botColor: Board.Color,
    userId: Option.Option<UserId.UserId>
    board: Board.Model
}

export type DrawAgreement =
    | {
        type: "NotAsking"
    }
    | {
        type: "Asking"
        asker: Board.Color
    }

export type GameOver =
    | {
        type: "Resignation"
    }
    | {
        type: "Checkmate"
        winner: Board.Color
    }
    | {
        type: "Stalemate"
    }

export const init: SetupModel = {
    type: "Setup",
    botColor: "b",
    userId: Option.None
}
