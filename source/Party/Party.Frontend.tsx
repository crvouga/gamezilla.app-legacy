import { Cmd, Sub } from "../Core";
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Party.Types";
import * as UI from "../UI"
import { PartyId, UserId } from "../Data";
import * as Route from "../Route"

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
        // 
        //
        //
        //
        // 

        case 'ClickedBanner': {
            return [model, Route.push(['Party'])]
        }

        // 
        //
        //
        //
        // 

        case "StartParty": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'Sync': {
            return [msg[1], Cmd.None]
        }

        case 'StartPartyResulted': {
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

export const view = ({ currentUserId }: { currentUserId: UserId.UserId }, model: Model): UI.View<Msg> => (dispatch) => {
    if (model.type === 'NotInParty') {
        return <UI.FillBox>
            <UI.Box sx={{ flex: 1 }}>

            </UI.Box>
            <UI.Box sx={{ padding: 2 }}>
                <UI.Button fullWidth variant="contained" size="large" onClick={() => dispatch(['StartParty', { hostId: currentUserId, partyId: PartyId.generateSync() }])}>
                    Start Party
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    }

    return <UI.FillBox>
        <UI.Box sx={{ flex: 1 }}>


        </UI.Box>
        <UI.Box sx={{ padding: 2 }}>
            <UI.Button fullWidth variant="contained" size="large">
                Leave Party
            </UI.Button>
        </UI.Box>
    </UI.FillBox>
}

export const viewBanner = ({ route, currentUserId, model }: { route: Route.Model, currentUserId: UserId.UserId, model: Model }): UI.View<Msg> => (dispatch) => {

    if (model.type === 'NotInParty') {
        return <></>
    }

    if (route[0] === 'Party') {
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
        <UI.ButtonBase onClick={() => dispatch(['ClickedBanner'])} sx={{ width: "100%", height: "100%", padding: 2 }}>
            <UI.Typography variant="h6">
                Go to party
            </UI.Typography>
        </UI.ButtonBase>
    </UI.Paper>

} 