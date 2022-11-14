import { Cmd, p, Sub } from "../../../Core";
import { isBotTurn, initShared, BackendMsg, BackendModel, ToBackend, handle, Res, ToFrontend, botMove } from "./UserVsBot.Types"
import { UserId } from "../../../Data/UserId"
import { getBestMove, opposite } from "../ConnectFour";

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

export const update = ({ sendToRoom }: { sendToRoom: (m: ToFrontend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "BotMove": {
            const result = botMove(msg[1], model)
            if (result.type === 'Err') {
                return [model, sendToRoom(['BotMove', result])]
            }
            return [result.value, sendToRoom(['BotMove', result])]
        }
    }
};


export const updateFromFrontend = (
    wire: { sendToRoom: (msg: ToFrontend) => Cmd, sendToClient: (msg: ToFrontend) => Cmd },
    msg: ToBackend,
    modelPrev: Model
): [Model, Cmd<Msg>] => {
    const [modelNext, cmd] = updateFromFrontend_(wire, msg, modelPrev)

    if (!isBotTurn(modelPrev) && isBotTurn(modelNext) && modelNext.type === 'Game') {
        return [
            modelNext,
            Cmd.batch([
                cmd,
                p(
                    getBestMove({ columns: modelNext.columns, maximizingPlayer: opposite[modelNext.userPlayerType] }),
                    Cmd.perform(result => ['BotMove', result])
                )
            ])
        ]
    }

    return [modelNext, cmd]
}

const updateFromFrontend_ = (
    { sendToRoom, sendToClient }: { sendToRoom: (msg: ToFrontend) => Cmd, sendToClient: (msg: ToFrontend) => Cmd },
    msg: ToBackend,
    model: Model
): [Model, Cmd<Msg>] => {
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

export const updateRoomLeave = ({ userId, model, sendToRoom }: {
    sendToRoom: (m: ToFrontend) => Cmd,
    userId: UserId,
    model: Model,
}): [Model, Cmd<Msg>] => {
    if (model.player !== userId) {
        return [model, Cmd.None]
    }

    const modelNew: Model = {
        type: "Setup",
        botLevel: model.botLevel,
        userPlayerType: model.userPlayerType,
        player: "None"
    }

    return [modelNew, sendToRoom(['PlayerLeft', modelNew])]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};
