import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data";
import { initShared, BackendModel, BackendMsg, ToBackend, handle, ToFrontend, Res } from "./VsUser.Types";

//
//
//
// model
//
//
//

export type Model = BackendModel;


export const init = initShared

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


export const updateFromFrontend = ({ sendToClient, broadcast, msg, model, ctx }: { ctx: { currentUserId: UserId, }; msg: ToBackend, model: Model, broadcast: (m: ToFrontend) => Cmd, sendToClient: (m: ToFrontend) => Cmd }): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        default: {
            const res: Res = [msg[0], handle({ msg, model, currentUserId: ctx.currentUserId })]
            if (res[1].type === "Err") {
                return [model, sendToClient(res)]
            }
            return [res[1].value, broadcast(res)]
        }
    }
};

export const updateRoomLeave = (_userId: UserId, model: Model): [Model, Cmd<Msg>] => {
    return [init(model), Cmd.None]
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
