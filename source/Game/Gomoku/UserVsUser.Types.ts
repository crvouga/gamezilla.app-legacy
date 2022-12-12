import { UserId } from "../../Data";

// 
// 
// Model
// 
// 



export type Model = {
    tag: "setup";
    white: UserId | "None"
    black: UserId | "None"
}

export type FrontendModel = Model

export type BackendModel = Model

// 
// 
// Msg
// 
// 

export type FrontendMsg = ["None"]

export type BackendMsg = ["None"]

export type ToBackend = ["None"]

export type ToFrontend = ["None"]

// 
// 
// 
// 
// 

type Color = "white" | "black"

export type Req = ['InputPlayer', { color: Color, userId: UserId }]


