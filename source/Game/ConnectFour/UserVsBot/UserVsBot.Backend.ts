import { Cmd, Sub } from "../../../Core";
import { initShared, BackendMsg, BackendModel, ToBackend, handle, Res, ToFrontend } from "./UserVsBot.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromFrontend = (
    { sendToRoom, sendToClient }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>, sendToClient: (msg: ToFrontend) => Cmd.Cmd<never> },
    msg: ToBackend,
    model: Model
): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'Restart':
        case 'StartGame':
        case 'StartPlaying':
        case 'StopGame':
        case 'StopPlaying':
        case 'SwapSides':
        case 'InputPlayerType':
        case 'InputMove':
        case "InputBotLevel": {
            const res: Res = [msg[0], handle(msg, model)]

            if (res[1].type === 'Err') {
                return [model, sendToClient(res)]
            }

            return [res[1].value, sendToRoom(res)]
        }
    }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};
