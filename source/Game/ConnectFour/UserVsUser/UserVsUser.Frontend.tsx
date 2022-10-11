import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI"
import { ViewPlayerOneGradientDef, ViewPlayerTwoGradientDef } from "../ConnectFour";
import { initShared, FrontendModel, FrontendMsg } from "./UserVsUser.Types"
//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
        }
    }
};

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

export const View = ({ model, dispatch, roomComponent, goBack, goHome }: { model: Model, dispatch: (msg: Msg) => void, roomComponent: UI.ViewNode, goBack: () => void, goHome: () => void }) => {
    const homeButton = (
        <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}>
            <UI.Icons.Home />
        </UI.IconButton>
    )

    return (
        <UI.FillBox>
            <UI.Header left={homeButton} title="Connect Four" right={roomComponent} />
            <UI.Box sx={{ paddingX: 2, display: 'flex', paddingBottom: 2 }}>
                <UI.SvgIcon viewBox="-1 -1 2 2" sx={{ width: 42, height: 42, marginRight: 1 }}>
                    <ViewPlayerOneGradientDef gradientId="playerOneGradient" />
                    <circle cx={0} cy={0} r={1} fill={`url(#playerOneGradient)`} />
                </UI.SvgIcon>
                <UI.Button fullWidth variant="contained">
                    Play as Red
                </UI.Button>
            </UI.Box>

            <UI.Box sx={{ paddingX: 2, display: 'flex' }}>
                <UI.SvgIcon viewBox="-1 -1 2 2" sx={{ width: 42, height: 42, marginRight: 1 }}>
                    <ViewPlayerTwoGradientDef gradientId="playerTwoGradient" />
                    <circle cx={0} cy={0} r={1} fill={`url(#playerTwoGradient)`} />
                </UI.SvgIcon>
                <UI.Button fullWidth variant="contained">
                    Play as Yellow
                </UI.Button>
            </UI.Box>

            <UI.Divider sx={{ paddingY: 2 }} />

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ padding: 2, gap: 2, display: 'flex' }}>
                <UI.Button variant="outlined" fullWidth onClick={goBack}>
                    Back
                </UI.Button>
                <UI.Button variant="contained" fullWidth>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )
}