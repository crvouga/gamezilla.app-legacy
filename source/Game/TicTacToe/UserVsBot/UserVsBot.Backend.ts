import { Cmd, Sub } from "../../../Core";
import { BackendModel, BackendMsg, initSharedModel, inputBot, inputPlayerType, Response, startGame, startPlaying, stopPlaying, ToBackend, ToFrontend } from "./UserVsBot.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "Noop": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromFrontend = ({ sendToClient, sendToRoom }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>, sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StartGame': {
            const response: Response = ['StartGame_Done', startGame(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }
        case 'StopPlaying': {
            const response: Response = ['StopPlaying_Done', stopPlaying(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'StartPlaying': {
            const response: Response = ['StartPlaying_Done', startPlaying(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'InputBot': {
            const response: Response = ['InputBot_Done', inputBot(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'InputPlayerType': {
            const response: Response = ['InputPlayerType_Done', inputPlayerType(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }
    }

}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};
