import { Cmd, exhaustive, Sub } from "../../../Core"
import {
    BackendModel,
    BackendMsg,

    initShared,

    ToBackend,
    ToFrontend
} from "./UserVsBot.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = initShared


//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
    { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> },
    msg: Msg,
    model: Model,
): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'None': {
            return [model, Cmd.None]
        }
    }
}

export const updateFromFrontend = (
    {
        sendToClient,
        sendToRoom,
    }: {
        sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
        sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
    },
    msg: ToBackend,
    model: Model,
): [Model, Cmd.Cmd<Msg>] => {
    return [model, Cmd.None]
    // switch (msg[0]) {


    //     default: {
    //         return exhaustive(msg[0])
    //     }
    // }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
    intervalId: string,
    model: Model,
): Sub.Sub<Msg> => {
    return Sub.None
}
