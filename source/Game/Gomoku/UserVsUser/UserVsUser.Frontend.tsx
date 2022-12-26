import { Cmd, Sub } from "../../../Core";
import { Ctx, viewUserVsUserSetupScreen } from "../../Game";
import { viewCoverArt, viewStoneIcon } from "../Gomoku/Gomoku";
import { initShared, BackendModel, ToFrontend, FrontendMsg, FrontendModel } from "./UserVsUser.Types"

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

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
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

export const view = ({ model, ctx, onCancel }: { ctx: Ctx; model: Model, onCancel: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                viewUserVsUserSetupScreen({
                    title: "Gomoku",
                    subtitle: "Player Vs Player",
                    coverArt: viewCoverArt(),
                    ctx,
                    playerOne: {
                        label: 'White',
                        userId: model.white,
                        onStartPlaying: () => { },
                        onStopPlaying: () => { },
                        icon: (sx) => viewStoneIcon({ ...sx, stone: 'white' })
                    },
                    playerTwo: {
                        label: 'Black',
                        userId: model.black,
                        onStartPlaying: () => { },
                        onStopPlaying: () => { },
                        icon: sx => viewStoneIcon({ ...sx, stone: 'black' })
                    },
                    onCancel,
                    onStartGame: () => { },
                })
            )
        }
    }

}