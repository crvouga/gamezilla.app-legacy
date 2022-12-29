import { Cmd, Sub } from "../../Core";
import { UserId } from "../../Data";
import { ToBackend, BackendMsg, BackendModel, Mode, ToFrontend } from "./Gomoku.Types"
import * as VsUser from "./VsUser/VsUser.Backend"
import * as VsBot from "./VsBot/VsBot.Backend"
import { Ok } from "../../Core/Result";

//
//
//
// model
//
//
//

export type Model = BackendModel;


export const init: Model = {
    type: "None"
}

const initMode = ({ mode, userId }: { mode: Mode, userId: UserId }): Model => {
    switch (mode) {
        case "None": {
            return { type: "None" }
        }

        case "VsBot": {
            return {
                type: "VsBot",
                child: VsBot.init({ userId })
            }
        }

        case "VsUser": {
            return {
                type: "VsUser",
                child: VsUser.init({ white: userId, black: null }),
            }
        }
    }
}

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
        case "VsBot": {
            return [model, Cmd.None]
        }
        case 'VsUser': {
            return [model, Cmd.None]
        }
    }
};


export const updateFromFrontend = ({ ctx, broadcast, sendToClient }: { ctx: { currentUserId: UserId }; sendToClient: (m: ToFrontend) => Cmd, broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputMode": {
            const modelNew = initMode(msg[1])
            return [modelNew, broadcast(['InputMode', msg[1], Ok(modelNew)])]
        }

        case 'VsBot': {
            if (model.type === 'VsBot') {
                const [child, cmd] = VsBot.updateFromFrontend(
                    {
                        ctx,
                        broadcast: (m) => broadcast(['VsBot', m]),
                        sendToClient: (m) => sendToClient(['VsBot', m])
                    },
                    msg[1],
                    model.child
                )
                return [{ type: 'VsBot', child }, Cmd.tag('VsBot', cmd)]
            }
            return [model, Cmd.None]
        }

        case 'VsUser': {
            if (model.type === 'VsUser') {
                const [child, cmd] = VsUser.updateFromFrontend({
                    msg: msg[1],
                    model: model.child,
                    ctx,
                    broadcast: (m) => broadcast(['VsUser', m]),
                    sendToClient: m => sendToClient(['VsUser', m])
                })

                return [{ type: 'VsUser', child }, Cmd.tag('VsUser', cmd)]
            }
            return [model, Cmd.None]
        }
    }
};


export const updateRoomLeave = (userId: UserId, model: Model): [Model, Cmd<Msg>] => {
    switch (model.type) {
        case "VsBot": {
            const [child, cmd] = VsBot.updateRoomLeave(userId, model.child)
            return [{ type: "VsBot", child }, Cmd.tag("VsBot", cmd)]
        }
        case "VsUser": {
            const [child, cmd] = VsUser.updateRoomLeave(userId, model.child)
            return [{ type: "VsUser", child }, Cmd.tag("VsUser", cmd)]
        }
        case "None": {
            return [model, Cmd.None]
        }
    }
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
