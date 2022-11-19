import { Cmd, Sub } from "../../Core";
import { UserId } from "../../Data";
import { BackendModel, BackendMsg, handle, initShared, Res, ToBackend, ToFrontend } from "./Maze.Types";
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

export const updateFromFrontend = ({ broadcast }: { broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StartPlaying': {
            const res: Res = [...msg, handle(msg, model)]
            return [model, broadcast(res)]
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