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


export const updateFromFrontend = ({ ctx, sendToClient, broadcast }: { ctx: { currentUserId: UserId }; sendToClient: (m: ToFrontend) => Cmd, broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        default: {
            const res: Res = [msg[0], handle(ctx, msg, model)]
            if (res[1].type === 'Err') {
                return [model, sendToClient(res)]
            }
            return [res[1].value, broadcast(res)]
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
