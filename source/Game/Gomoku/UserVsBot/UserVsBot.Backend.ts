import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data";
import { initShared, BackendModel, BackendMsg, ToBackend, handle, Res, ToFrontend } from "./UserVsBot.Types";

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init: Model = initShared

//
//
//
// update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};


export const updateFromFrontend = ({ sendToClient, broadcast }: { sendToClient: (m: ToFrontend) => Cmd, broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputUserStone':
        case 'InputBotLevel':
        case 'StartGame':
        case 'StartPlaying':
        case "StopPlaying": {
            const res: Res = [...msg, handle(msg, model)]
            if (res[2].type === 'Err') {
                return [model, sendToClient(res)]
            }
            return [model, broadcast(res)]
        }
    }
};

export const updateRoomLeave = (_userId: UserId, _model: Model): [Model, Cmd<Msg>] => {
    return [init, Cmd.None]
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};
