import { Cmd, Sub } from "../../Core";
import { Ctx, GameRoomCtx, viewSelectModeScreen } from "../Game";
import { BackendModel, FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Gomoku.Types";
import { viewCoverArt } from "./Gomoku/Gomoku";
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend";
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend";

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
    type: "None"
}

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend, }: { sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputMode": {
            return [model, sendToBackend(msg)]
        }
        case 'UserVsBot': {
            if (model.type === 'UserVsBot') {
                const [child, cmd] = UserVsBot.update({ sendToBackend: m => sendToBackend(['UserVsBot', m]) }, msg[1], model.child)
                return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
            }

            return [model, Cmd.None]
        }
        case 'UserVsUser': {
            return [model, Cmd.None]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputMode": {
            if (msg[2].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[2].value })
            return [merged, Cmd.None]
        }

        case 'UserVsBot': {
            if (model.type === 'UserVsBot') {
                const [child, cmd] = UserVsBot.updateFromBackend(msg[1], model.child)
                return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
            }
            return [model, Cmd.None]
        }
        case 'UserVsUser': {
            return [model, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ frontendModel, backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    switch (backendModel.type) {
        case 'None': {
            return { type: "None" }
        }

        case 'UserVsBot': {
            if (frontendModel.type === 'UserVsBot') {
                return { type: "UserVsBot", child: UserVsBot.mergeWithBackend({ frontendModel: frontendModel.child, backendModel: backendModel.child }) }
            }
            return { type: "UserVsBot", child: UserVsBot.mergeWithBackend({ frontendModel: UserVsBot.init({ userId: null }), backendModel: backendModel.child }) }
        }

        case 'UserVsUser': {
            if (frontendModel.type === 'UserVsUser') {
                return { type: "UserVsUser", child: UserVsUser.mergeWithBackend({ frontendModel: frontendModel.child, backendModel: backendModel.child }) }
            }
            return { type: "UserVsUser", child: UserVsUser.mergeWithBackend({ frontendModel: UserVsUser.init, backendModel: backendModel.child }) }
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

// 
// 
// 
// view
// 
// 
// 

export const view = ({ model, ctx, gameRoomCtx, $d }: { model: Model, ctx: Ctx, gameRoomCtx: GameRoomCtx, $d: (m: Msg) => void }) => {
    switch (model.type) {
        case 'None': {
            return (
                viewSelectModeScreen({
                    coverArt: viewCoverArt(),
                    ctx,
                    gameRoomCtx,
                    onUserVsComputer: () => $d(['InputMode', { userId: ctx.currentUserId, mode: "UserVsBot" }]),
                    onUserVsUser: () => $d(['InputMode', { userId: ctx.currentUserId, mode: "UserVsUser" }]),
                    title: "Gomoku"
                })

            )
        }

        case 'UserVsBot': {
            return UserVsBot.view({ model: model.child, ctx, onBack: () => $d(['InputMode', { mode: "None", userId: ctx.currentUserId }]), $d: m => $d(['UserVsBot', m]) })
        }

        case 'UserVsUser': {
            return UserVsUser.view({ model: model.child, })
        }
    }

}


export const coverArt = viewCoverArt