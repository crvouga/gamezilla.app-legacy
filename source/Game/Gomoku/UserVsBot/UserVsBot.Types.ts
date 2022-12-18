import { Result } from "../../../Core"
import { Err, Ok } from "../../../Core/Result"
import { UserId } from "../../../Data"
import { toOppositeStone, MoveProblem, Board, BotLevel, initBoard, move, Stone } from "../Gomoku/Gomoku"
import { Position } from "../Gomoku/Position"


// 
// 
// 
// Model
// 
// 
// 

export type Model = SetupModel | GameModel

export type SetupModel = {
    type: "setup",
    userId: UserId | null
    userStone: Stone
    botLevel: BotLevel
}

export type GameModel = {
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
    // setup
    | ['StartPlaying']
    | ['StopPlaying']
    | ['InputUserStone', { userStone: Stone }]
    | ['InputBotLevel', { botLevel: BotLevel }]
    | ['StartGame']
    // game
    | ['InputMove', { position: Position }]
    | ['StopGame']
    | ['Restart']
    | ['SwapSides']


export type Res = [Req[0], Result<Problem, Model>]

export type Problem =
    | "must_be_player"
    | "must_be_setup"
    | "must_be_no_player"
    | "must_be_game"
    | MoveProblem

export const handle = ({ currentUserId }: { currentUserId: UserId }, msg: Req, model: Model): Result<Problem, Model> => {
    switch (msg[0]) {
        case 'InputBotLevel': {
            if (model.type !== 'setup') {
                return Err("must_be_setup")
            }
            if (model.userId !== currentUserId) {
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
            if (model.userId !== currentUserId) {
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
                userId: currentUserId
            }
            return Ok(modelNew)
        }

        case 'StopPlaying': {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }
            if (model.userId !== currentUserId) {
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
            if (model.userId !== currentUserId) {
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

        case 'InputMove': {
            if (model.type !== 'game') {
                return Err("must_be_game")
            }

            if (model.userId !== currentUserId) {
                return Err("must_be_player")
            }

            const moved = move({
                position: msg[1].position,
                stone: model.userStone,
                board: model.board
            })

            if (moved.type === 'Err') {
                return moved
            }

            const modelNew: Model = {
                ...model,
                board: moved.value
            }

            return Ok(modelNew)
        }

        case 'StopGame': {
            if (model.type !== 'game') {
                return Err("must_be_game")
            }

            if (model.userId !== currentUserId) {
                return Err("must_be_player")
            }

            const modelNew: Model = {
                type: "setup",
                botLevel: model.botLevel,
                userId: model.userId,
                userStone: model.userStone
            }

            return Ok(modelNew)
        }

        case 'Restart': {
            if (model.type !== 'game') {
                return Err("must_be_game")
            }

            if (model.userId !== currentUserId) {
                return Err("must_be_player")
            }

            const modelNew: Model = {
                ...model,
                board: initBoard
            }

            return Ok(modelNew)
        }

        case 'SwapSides': {
            if (model.type !== 'game') {
                return Err("must_be_game")
            }

            if (model.userId !== currentUserId) {
                return Err("must_be_player")
            }

            const modelNew: Model = {
                ...model,
                userStone: toOppositeStone(model.userStone)
            }

            return Ok(modelNew)
        }
    }
}

