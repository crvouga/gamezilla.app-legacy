import { Result } from "../../../Core"
import { Err, Ok } from "../../../Core/Result"
import { UserId } from "../../../Data"
import { Board, BotLevel, initBoard, Stone } from "../Gomoku/Gomoku"

// 
// 
// 
// Model
// 
// 
// 

export type Model =
    | {
        type: "setup",
        userId: UserId | null
        userStone: Stone
        botLevel: BotLevel
    }
    | {
        type: "game",
        userId: UserId,
        userStone: Stone
        botLevel: BotLevel
        board: Board
    }

export type FrontendModel = Model

export type BackendModel = Model

export const initShared: Model = {
    type: "setup",
    userId: null,
    userStone: "black",
    botLevel: "Medium"
}

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req

export type BackendMsg = ["none"]

export type ToBackend = Req

export type ToFrontend = Res

// 
// 
// 
// 
// 

export type Req =
    | ['StartPlaying', { userId: UserId }]
    | ['StopPlaying', { userId: UserId }]
    | ['InputUserStone', { userId: UserId, userStone: Stone }]
    | ['InputBotLevel', { userId: UserId, botLevel: BotLevel }]
    | ['StartGame', { userId: UserId, }]

export type Res = [...Req, Result<Problem, Model>]

export type Problem = "must_be_player" | "must_be_setup" | "must_be_no_player"

export const handle = (msg: Req, model: Model): Result<Problem, Model> => {
    switch (msg[0]) {
        case 'InputBotLevel': {
            if (model.type !== 'setup') {
                return Err("must_be_setup")
            }
            if (model.userId !== msg[1].userId) {
                return Err("must_be_player")
            }
            const modelNew: Model = {
                ...model,
                botLevel: msg[1].botLevel
            }
            return Ok(modelNew)
        }

        case 'InputUserStone': {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }
            if (model.userId !== msg[1].userId) {
                return Err("must_be_player")
            }
            const modelNew: Model = {
                ...model,
                userStone: msg[1].userStone
            }
            return Ok(modelNew)
        }

        case 'StartPlaying': {
            if (model.type !== 'setup') {
                return Err("must_be_setup")
            }
            if (model.userId) {
                return Err("must_be_no_player")
            }
            const modelNew: Model = {
                ...model,
                userId: msg[1].userId
            }
            return Ok(modelNew)
        }

        case 'StopPlaying': {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }
            if (model.userId !== msg[1].userId) {
                return Err("must_be_player")
            }
            const modelNew: Model = {
                ...model,
                userId: null
            }
            return Ok(modelNew)
        }

        case 'StartGame': {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }
            if (model.userId !== msg[1].userId) {
                return Err("must_be_player")
            }
            const modelNew: Model = {
                type: "game",
                board: initBoard,
                botLevel: model.botLevel,
                userId: model.userId,
                userStone: model.userStone
            }
            return Ok(modelNew)
        }
    }
}

