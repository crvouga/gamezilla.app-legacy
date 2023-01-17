import { Cmd, Result, Sub } from "@gamezilla/core";
import { UserId } from "@gamezilla/data";
import { BackendModel, BackendMsg, Mode, ToBackend, ToFrontend } from "./gomoku.types";
import * as VsBot from "./vs-bot/vs-bot.backend";
import * as VsUser from "./vs-user/vs-user.backend";

const { Ok } = Result

//
//
//
// model
//
//
//

export type Model = BackendModel;


export const init: Model = {
    type: "none"
}

const initMode = ({ mode, userId }: { mode: Mode, userId: UserId }): Model => {
    switch (mode) {
        case "none": {
            return { type: "none" }
        }

        case "vs-bot": {
            return {
                type: "vs-bot",
                child: VsBot.init({ userId })
            }
        }

        case "vs-user": {
            return {
                type: "vs-user",
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
        case "vs-bot": {
            return [model, Cmd.None]
        }
        case "vs-user": {
            return [model, Cmd.None]
        }
    }
};


export const updateFromFrontend = ({ ctx, broadcast, sendToClient }: { ctx: { currentUserId: UserId }; sendToClient: (m: ToFrontend) => Cmd, broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "input-mode": {
            const modelNew = initMode(msg[1])
            return [modelNew, broadcast(["input-mode", msg[1], Ok(modelNew)])]
        }

        case "vs-bot": {
            if (model.type === "vs-bot") {
                const [child, cmd] = VsBot.updateFromFrontend(
                    {
                        ctx,
                        broadcast: (m) => broadcast(["vs-bot", m]),
                        sendToClient: (m) => sendToClient(["vs-bot", m])
                    },
                    msg[1],
                    model.child
                )
                return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
            }
            return [model, Cmd.None]
        }

        case "vs-user": {
            if (model.type === "vs-user") {
                const [child, cmd] = VsUser.updateFromFrontend({
                    msg: msg[1],
                    model: model.child,
                    ctx,
                    broadcast: (m) => broadcast(["vs-user", m]),
                    sendToClient: m => sendToClient(["vs-user", m])
                })

                return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
            }
            return [model, Cmd.None]
        }
    }
};


export const updateRoomLeave = (userId: UserId, model: Model): [Model, Cmd<Msg>] => {
    switch (model.type) {
        case "vs-bot": {
            const [child, cmd] = VsBot.updateRoomLeave(userId, model.child)
            return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
        }
        case "vs-user": {
            const [child, cmd] = VsUser.updateRoomLeave(userId, model.child)
            return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
        }
        case "none": {
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
