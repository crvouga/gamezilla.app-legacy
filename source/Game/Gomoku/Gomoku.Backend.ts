import { Cmd, Sub } from "../../Core";
import { UserId } from "../../Data";
import { ToBackend, BackendMsg, BackendModel, Mode, ToFrontend } from "./Gomoku.Types"
import * as VsUser from "./VsUser/VsUser.Backend"
import * as UserVsBot from "./UserVsBot/UserVsBot.Backend"
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

        case "UserVsBot": {
            return {
                type: "UserVsBot",
                child: UserVsBot.init({ userId })
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
        case "UserVsBot": {
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

        case 'UserVsBot': {
            if (model.type === 'UserVsBot') {
                const [child, cmd] = UserVsBot.updateFromFrontend(
                    {
                        ctx,
                        broadcast: (m) => broadcast(['UserVsBot', m]),
                        sendToClient: (m) => sendToClient(['UserVsBot', m])
                    },
                    msg[1],
                    model.child
                )
                return [{ type: 'UserVsBot', child }, Cmd.tag('UserVsBot', cmd)]
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
        case "UserVsBot": {
            const [child, cmd] = UserVsBot.updateRoomLeave(userId, model.child)
            return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
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
