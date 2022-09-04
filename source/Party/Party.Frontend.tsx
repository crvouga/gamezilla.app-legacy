import { Cmd, Sub } from "../Core";
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Party.Types";
import * as UI from "../UI"
import { UserId } from "../Data";

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [{ type: "NotInParty" }, Cmd.None];

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
        case "CreateParty": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'Sync': {
            return [msg[1], Cmd.None]
        }

        case 'CreatePartyResulted': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }

            const { hostId, partyId, routerRtpCapabilities } = msg[1].value

            return [{ type: "InParty", hostId, partyId, routerRtpCapabilities }, Cmd.None]
        }
    }
}


export type Action = ['Party', ['Msg', Msg]]

export const runAction = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (action[1][0]) {
        case 'Msg': {
            return update({ sendToBackend }, action[1][1], model)
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

// 
// 
// 
// View
// 
// 
// 

export const view = (model: Model): UI.View<Msg> => (dispatch) => {
    return <>
        party
        <pre>
            {JSON.stringify(model, null, 4)}
        </pre>
    </>
}

export const viewBanner = ({ currentUserId, model }: { currentUserId: UserId.UserId, model: Model }): UI.View<Msg> => (dispatch) => {

    if (model.type === 'NotInParty') {
        return <></>
    }

    return <UI.Paper
        variant="outlined"
        sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: 54,
            padding: 0,
            margin: 0,
        }}
    >
        <UI.ButtonBase sx={{ width: "100%", height: "100%", padding: 2 }}>
            <UI.Typography variant="h6">
                Go to party
            </UI.Typography>
        </UI.ButtonBase>
    </UI.Paper>

} 