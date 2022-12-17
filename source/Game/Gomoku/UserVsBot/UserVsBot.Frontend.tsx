import { Cmd, Sub } from "../../../Core";
import { Ctx, UserVsBotSetupPage } from "../../Game.Shared";
import { viewCoverArt } from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, initShared, ToFrontend } from "./UserVsBot.Types";

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = initShared

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

export const view = ({ model, ctx }: { model: Model, ctx: Ctx }) => {

    switch (model.type) {
        case 'setup': {
            return (
                <UserVsBotSetupPage
                    botLevel={{
                        onInput: () => { },
                        selected: null,
                        values: []
                    }}
                    coverArt={viewCoverArt()}
                    player={{
                        onInput: () => { },
                        selected: null,
                        values: [],
                        icon: () => <></>
                    }}
                    ctx={ctx}
                    title="Gomoku"
                    subtitle="Vs Computer"
                    onCancel={() => { }}
                    onStartGame={() => { }}
                    onStartPlaying={() => { }}
                    onStopPlaying={() => { }}
                    playerId={null}
                />
            )
        }
    }


}