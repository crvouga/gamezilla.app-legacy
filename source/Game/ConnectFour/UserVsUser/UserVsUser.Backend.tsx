import { Cmd, exhaustive, Sub, Time } from "../../../Core";
import { UserId } from "../../../Data/UserId";
import { BackendModel, BackendMsg, handle, initShared, Res, tick, ToBackend, ToFrontend, toPlayerType } from "./UserVsUser.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = ({ broadcast }: { broadcast: (msg: ToFrontend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "Tick": {
            const modelNew = tick(model)
            return [modelNew, broadcast(['Tick_Done', modelNew])]
        }
    }
};

export const updateFromFrontend = ({ sendToClient, broadcast }: { sendToClient: (msg: ToFrontend) => Cmd, broadcast: (msg: ToFrontend) => Cmd }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'Resign':
        case 'NewGame':
        case 'Rematch_Cancel':
        case 'Rematch_Request':
        case 'Rematch_Respond':
        case 'InputMoveTimeLimit':
        case 'InputMove':
        case 'StartGame':
        case 'StopPlaying':
        case 'StartPlaying': {
            const res: Res = [msg[0], handle(msg, model)]

            if (res[1].type === 'Err') {
                return [model, sendToClient(res)]
            }

            return [res[1].value, broadcast(res)]
        }

        default: {
            return exhaustive(msg[0])
        }
    }
}

export const updateRoomLeave = ({ broadcast, userId, model }: { broadcast: (m: ToFrontend) => Cmd, userId: UserId, model: Model }): [Model, Cmd<Msg>] => {
    const player = toPlayerType(userId, model)

    if (player === 'None') {
        return [model, Cmd.None]
    }

    const modelNew: Model = {
        type: "Setup",
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
        [player]: 'None',
    }

    return [modelNew, broadcast(['PlayerLeft', modelNew])]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
    switch (model.type) {
        case 'GameOver': {
            return Sub.None;
        }

        case 'Setup': {
            return Sub.None;
        }

        case 'Game': {
            return Time.every(intervalId, 1000, () => ['Tick']);
        }
    }
};
