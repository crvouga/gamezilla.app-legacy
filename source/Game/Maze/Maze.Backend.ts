import { Cmd, Sub } from "../../Core";
import { UserId } from "../../Data";
import { BackendModel, BackendMsg, initShared, ToBackend } from "./Maze.Types";
//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: BackendModel = initShared

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromFrontend = (msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'None': {
            return [model, Cmd.None]
        }
    }
}

export const updateRoomLeave = (_userId: UserId, model: Model): [Model, Cmd<Msg>] => {
    return [model, Cmd.None]
}

// 
// 
// 
// Subscriptions
// 
// 
// 

export const subscriptions = (_model: BackendModel): Sub<Msg> => {
    return Sub.None
}