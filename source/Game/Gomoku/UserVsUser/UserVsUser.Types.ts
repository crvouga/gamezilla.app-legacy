import { Result, Ok, Err } from "../../../Core/Result"
import { UserId } from "../../../Data"
import { Stone, toOppositeStone } from "../Gomoku/Gomoku"

// 
// 
// 
// Model
// 
// 
// 

export type Model = {
    type: "setup",
    white: UserId | null,
    black: UserId | null,
}

export type FrontendModel = Model

export type BackendModel = Model

export const initShared = ({ white, black }: { white: UserId | null, black: UserId | null }): Model => {
    return {
        type: "setup",
        white,
        black,
    }
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

export type ToFrontend = Res

export type ToBackend = Req

// 
// 
// 
// 
// 

export type Req =
    | ['StartPlaying', { stone: Stone }]
    | ['StopPlaying', { stone: Stone }]

export type Res = [Req[0], Result<Problem, Model>]

type Problem = 'must_be_setup' | 'player_taken' | "must_be_player"



export const handle = ({ currentUserId, msg, model }: { currentUserId: UserId, msg: Req, model: Model }): Result<Problem, Model> => {
    switch (msg[0]) {
        case "StartPlaying": {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }

            const { stone } = msg[1]

            if (model[stone]) {
                return Err('player_taken')
            }

            const modelNew: Model = {
                ...model,
                [stone]: currentUserId,
                [toOppositeStone(stone)]: model[toOppositeStone(stone)] === currentUserId ? null : model[toOppositeStone(stone)],
            }

            return Ok(modelNew)
        }

        case 'StopPlaying': {
            if (model.type !== 'setup') {
                return Err('must_be_setup')
            }

            const { stone } = msg[1]

            if (model[stone] !== currentUserId) {
                return Err('must_be_player')
            }

            const modelNew: Model = {
                ...model,
                [stone]: null,
            }

            return Ok(modelNew)
        }
    }
}


