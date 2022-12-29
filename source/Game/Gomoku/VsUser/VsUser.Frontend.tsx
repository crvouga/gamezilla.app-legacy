import { Cmd, Sub } from "../../../Core";
import { Ctx, viewVsUserSetupScreen } from "../../Game";
import { viewCoverArt, viewStoneIcon } from "../Gomoku/Gomoku";
import { initShared, BackendModel, ToFrontend, FrontendMsg, FrontendModel, ToBackend } from "./VsUser.Types"

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = ({ msg, model, sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd, msg: Msg, model: Model }): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StopPlaying':
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StopPlaying':
        case "StartPlaying": {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ backendModel: msg[1].value, frontendModel: model })
            return [merged, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
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

export const view = ({ model, ctx, onCancel, $send }: { $send: (m: Msg) => void; ctx: Ctx; model: Model, onCancel: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                viewVsUserSetupScreen({
                    title: "Gomoku",
                    subtitle: "Player Vs Player",
                    coverArt: viewCoverArt(),
                    ctx,
                    playerOne: {
                        label: 'White',
                        userId: model.white,
                        onStartPlaying: () => $send(['StartPlaying', { stone: 'white' }]),
                        onStopPlaying: () => $send(['StopPlaying', { stone: 'white' }]),
                        icon: (sx) => viewStoneIcon({ ...sx, stone: 'white' })
                    },
                    playerTwo: {
                        label: 'Black',
                        userId: model.black,
                        onStartPlaying: () => $send(['StartPlaying', { stone: 'black' }]),
                        onStopPlaying: () => $send(['StopPlaying', { stone: 'black' }]),
                        icon: sx => viewStoneIcon({ ...sx, stone: 'black' })
                    },
                    onCancel,
                    onStartGame: () => { },
                })
            )
        }
    }

}