import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data";
import { move, toBestMove, toOppositeStone } from "../Gomoku/Gomoku";
import { BackendModel, BackendMsg, handle, initShared, Res, ToBackend, ToFrontend } from "./UserVsBot.Types";

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


type UpdateFromFrontend = (params: { ctx: { currentUserId: UserId }; sendToClient: (m: ToFrontend) => Cmd, broadcast: (m: ToFrontend) => Cmd }, msg: ToBackend, model: Model) => [Model, Cmd<Msg>]

export const updateFromFrontend: UpdateFromFrontend = (params, msg, modelPrev) => {
    const [model, cmd] = updateFromFrontend_(params, msg, modelPrev)

    if (model.type !== 'game') {
        console.log('not game', modelPrev)
        return [model, cmd]
    }

    const isBotTurn = model.userStone === toOppositeStone(model.userStone)

    if (!isBotTurn) {
        return [model, cmd]
    }

    const botStone = toOppositeStone(model.userStone)

    const position = toBestMove({ stone: botStone, board: model.board, })

    if (!position) {
        return [model, cmd]
    }

    const moved = move({ stone: botStone, position, board: model.board })

    if (moved.type === 'Err') {
        return [model, cmd]
    }

    const modelNew: Model = { ...model, board: moved.value }

    return [modelNew, cmd]
}



const updateFromFrontend_: UpdateFromFrontend = ({ ctx, sendToClient, broadcast }, msg, model) => {
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

export const updateRoomLeave = (_userId: UserId, model: Model): [Model, Cmd<Msg>] => {
    return [init({ userId: model.userId }), Cmd.None]
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
