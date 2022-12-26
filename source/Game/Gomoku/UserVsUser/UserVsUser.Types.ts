import { UserId } from "../../../Data"
import { Stone } from "../Gomoku/Gomoku"

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

export type FrontendMsg = ["none"]

export type BackendMsg = ["none"]

export type ToFrontend = ["none"]

export type ToBackend = ["none"]

// 
// 
// 
// 
// 

export type Req = ['start_playing', { stone: Stone }]


