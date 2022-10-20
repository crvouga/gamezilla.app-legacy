import { Cmd, Sub, Time } from "../../../Core";
import { BackendMsg, ToBackend, initShared, BackendModel, handle, ToFrontend, tick } from "./UserVsUser.Types";

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

export const update = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "Tick": {
            const modelNew = tick(model)
            return [modelNew, sendToRoom(['Tick_Done', modelNew])]
        }
    }
};

export const updateFromFrontend = ({ sendToClient, sendToRoom }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>, sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'RematchRequest':
        case 'RematchRespond':
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

export const subscriptions = (intervalId: string, model: Model): Sub.Sub<Msg> => {
    switch (model.type) {

        case 'GameOver': {
            return Sub.None;
        }

        case 'Setup': {
            return Sub.None;
        }

        case 'Game': {
            return Time.every(
                intervalId,
                1000,
                (): Msg => ['Tick']
            );
        }
    }
};
