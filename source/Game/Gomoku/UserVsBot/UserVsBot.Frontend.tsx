import { Cmd, Sub } from "../../../Core";
import { FillBox } from "../../../UI";
import { Ctx, UserVsBotSetupPage } from "../../Game.Shared";
import { botLevels, stones, viewCoverArt, viewStoneIcon } from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, initShared, ToBackend, ToFrontend } from "./UserVsBot.Types";

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

export const update = ({ sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputUserStone':
        case 'InputBotLevel':
        case 'StartGame':
        case 'StartPlaying':
        case "StopPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputUserStone':
        case 'InputBotLevel':
        case 'StartGame':
        case 'StartPlaying':
        case "StopPlaying": {
            if (msg[2].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({
                frontendModel: model,
                backendModel: msg[2].value
            })
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

export const view = ({ $d, model, ctx, onBack }: { model: Model, ctx: Ctx, $d: (m: Msg) => void; onBack: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                <UserVsBotSetupPage
                    botLevel={{
                        onInput: (botLevel) => $d(['InputBotLevel', { userId: ctx.currentUserId, botLevel }]),
                        selected: model.botLevel,
                        values: Object.values(botLevels)
                    }}
                    coverArt={viewCoverArt()}
                    player={{
                        onInput: (userStone) => $d(['InputUserStone', { userId: ctx.currentUserId, userStone }]),
                        selected: model.userStone,
                        values: Object.values(stones),
                        icon: (stone) => viewStoneIcon({ stone })
                    }}
                    ctx={ctx}
                    title="Gomoku"
                    subtitle="Vs Computer"
                    onCancel={onBack}
                    onStartPlaying={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}
                    onStopPlaying={() => $d(['StopPlaying', { userId: ctx.currentUserId }])}
                    onStartGame={() => { }}
                    playerId={model.userId}
                />
            )
        }

        case 'game': {
            return <FillBox>

            </FillBox>
        }
    }
}