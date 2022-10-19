import { Cmd, Sub } from "../../../Core";
import { BackendMsg, ToBackend, initShared, BackendModel, handle, ToFrontend } from "./UserVsUser.Types";

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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromFrontend = ({ sendToClient, sendToRoom }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>, sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputMoveTimeLimit':
        case 'InputMove':
        case 'StartGame':
        case 'StopPlaying':
        case 'StartPlaying': {
            const response = handle(msg, model)

            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }

            const modelNew = response[1].value

            return [modelNew, sendToRoom(response)]
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
