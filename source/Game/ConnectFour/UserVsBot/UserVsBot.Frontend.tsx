import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI";
import { UserId } from "../../../Data/UserId";
import { BackendModel, ToFrontend, FrontendMsg, initShared, FrontendModel, ToBackend } from "./UserVsBot.Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputMove':
        case 'InputPlayerType':
        case 'Restart':
        case 'StartGame':
        case 'StartPlaying':
        case 'StopGame':
        case 'StopPlaying':
        case 'SwapSides':
        case 'InputBotLevel': {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputMove':
        case 'InputPlayerType':
        case 'Restart':
        case 'StartGame':
        case 'StartPlaying':
        case 'StopGame':
        case 'StopPlaying':
        case 'SwapSides':
        case 'InputBotLevel': {

            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            return [msg[1].value, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return {
        ...backendModel
    }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// View
// 
// 
// 

export const View = (
    {
        model,
        goBack
    }: {
        model: Model,
        dispatch: (msg: Msg) => void,
        currentUserId: UserId,
        goBack: () => void
    }) => {
    return (
        <UI.FillBox>
            <pre>
                {JSON.stringify(model, null, 4)}
            </pre>

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ padding: 2, gap: 2, display: "flex", }}>
                <UI.Button variant="outlined" onClick={goBack} fullWidth>
                    Back
                </UI.Button>

                <UI.Button variant="contained" onClick={() => { }} fullWidth>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )
}