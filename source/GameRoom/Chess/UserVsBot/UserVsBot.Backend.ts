import { Cmd, exhaustive, Sub } from "../../../Core"
import {
    BackendModel,
    BackendMsg,

    initShared,

    inputBot,

    inputColor,

    inputUser,

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
    switch (msg[0]) {
        case 'Init': {
            return [model, sendToClient(['Sync', model])]
        }

        case 'InputUser': {
            const result = inputUser(msg[1], model)

            const modelNew = result.type === 'Err' ? model : result.value

            return [modelNew, sendToRoom(['InputUser_Done', msg[1], result])]
        }

        case 'InputColor': {
            const result = inputColor(msg[1], model)

            const modelNew = result.type === 'Err' ? model : result.value

            return [modelNew, sendToRoom(['InputColor_Done', result])]
        }


        case 'InputBot': {
            const result = inputBot(msg[1], model)

            const modelNew = result.type === 'Err' ? model : result.value

            return [modelNew, sendToRoom(['InputBot_Done', result])]
        }
    }
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
