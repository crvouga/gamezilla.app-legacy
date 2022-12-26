import { Cmd, Sub } from "../../Core";
import { UserId } from "../../Data";
import { ToBackend, BackendMsg, BackendModel, Mode, ToFrontend } from "./Gomoku.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"
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

        case "UserVsUser": {
            return {
                type: "UserVsUser",
                child: UserVsUser.init({ white: userId, black: null }),
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
        case 'UserVsUser': {
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

        case 'UserVsUser': {
            if (model.type === 'UserVsUser') {
                const [child, cmd] = UserVsUser.updateFromFrontend(
                    // { broadcast: (m) => broadcast(['UserVsUser', m]) },
                    msg[1],
                    model.child
                )
                return [{ type: 'UserVsUser', child }, Cmd.tag('UserVsUser', cmd)]
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
        case "UserVsUser": {
            const [child, cmd] = UserVsUser.updateRoomLeave(userId, model.child)
            return [{ type: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
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
