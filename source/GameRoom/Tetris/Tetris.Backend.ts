import { Cmd, Sub, Time } from "../../Core";
import { BackendModel, BackendMsg, initShared, inputDrop, inputRotate, inputTranslate, tick, ToBackend, ToFrontend } from "./Tetris.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = initShared

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
            const modelNext = tick(model)

            return [modelNext, sendToRoom(['Tick_Done', modelNext])]
        }

    }
};


export const updateFromFrontend = ({ sendToRoom, sendToClient }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>, sendToClient: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {


        case 'InputDrop': {
            const result = inputDrop(model)

            if (result.type === 'Err') {
                return [model, sendToClient(['InputDrop_Done', result])]
            }

            const modelNew = result.value

            return [modelNew, sendToRoom(['InputDrop_Done', result])]
        }


        case 'InputTranslate': {
            const result = inputTranslate(msg[1], model)

            if (result.type === 'Err') {
                return [model, sendToClient(['InputTranslate_Done', result])]
            }

            const modelNew = result.value

            return [modelNew, sendToRoom(['InputTranslate_Done', result])]
        }

        case 'InputRotate': {
            const result = inputRotate(model)

            if (result.type === 'Err') {
                return [model, sendToClient(['InputRotate_Done', result])]
            }

            const modelNew = result.value

            return [modelNew, sendToRoom(['InputRotate_Done', result])]
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
    return Time.every(intervalId, 500, (): Msg => ['Tick']);
};
