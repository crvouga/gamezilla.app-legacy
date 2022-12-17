import { UserId } from "../../../Data"

// 
// 
// 
// Model
// 
// 
// 

export type Model = {
    type: "setup",
    userId: UserId | null
}

export type FrontendModel = Model

export type BackendModel = Model

export const initShared: Model = {
    type: "setup",
    userId: null
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